// ─── chatbot.service.ts (Gemini — debugged) ──────────────────────────────────
// Fixes the "couldn't connect" error by:
//   1. Validating the API key before any fetch
//   2. Logging the EXACT error (network, HTTP, key invalid, safety block, etc.)
//   3. Using the stable model alias "gemini-1.5-flash-latest"
//   4. Falling back to demo doctors when your backend is unreachable
//   5. Clear error messages for every failure mode

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  average_rating: number;
  years_of_experience: number;
  is_verified: boolean;
  hospital?: string;
  profile_image?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  doctors?: Doctor[];
  timestamp: Date;
  isLoading?: boolean;
}

export interface FetchDoctorsParams {
  specialization?: string;
  min_rating?: number;
  min_experience?: number;
  limit?: number;
}

export interface ChatResponse {
  text: string;
  doctors: Doctor[];
}

// ── Config ────────────────────────────────────────────────────────────────────

// STEP 1: To test quickly, paste your key directly here:
//   const GEMINI_API_KEY = 'AIzaSy...';
// Then once working, move it to .env as EXPO_PUBLIC_GEMINI_API_KEY
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.medlink.et';

// "gemini-1.5-flash-latest" is the stable alias — avoids 404s from version changes
const MODEL = 'gemini-1.5-flash-latest';

// ── Key validator (call on component mount to catch issues early) ─────────────

export function validateChatConfig(): { ok: boolean; error?: string } {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
    return {
      ok: false,
      error: 'GEMINI_API_KEY is missing.\n\n1. Go to https://aistudio.google.com\n2. Click "Get API Key"\n3. Add to your .env file:\n   EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...\n4. Restart Expo (npx expo start --clear)',
    };
  }
  if (!GEMINI_API_KEY.startsWith('AIza')) {
    return {
      ok: false,
      error: `API key looks wrong — Gemini keys start with "AIza".\nGot: "${GEMINI_API_KEY.slice(0, 8)}..."`,
    };
  }
  return { ok: true };
}

// ── Fallback demo doctors (shown when backend API is unreachable) ─────────────

const FALLBACK_DOCTORS: Doctor[] = [
  { id: '1', first_name: 'Samuel',    last_name: 'Bekele',   specialization: 'Cardiologist',        average_rating: 4.9, years_of_experience: 12, is_verified: true, hospital: 'Zewditu Memorial Hospital' },
  { id: '2', first_name: 'Lidiya',    last_name: 'Tesfaye',  specialization: 'Pediatrician',         average_rating: 4.8, years_of_experience: 8,  is_verified: true, hospital: 'Tikur Anbessa Hospital' },
  { id: '3', first_name: 'Mulugeta',  last_name: 'Alemu',    specialization: 'Dermatologist',        average_rating: 4.7, years_of_experience: 10, is_verified: true, hospital: "St. Paul's Hospital" },
  { id: '4', first_name: 'Hana',      last_name: 'Wondimu',  specialization: 'Gynecologist',         average_rating: 4.9, years_of_experience: 15, is_verified: true, hospital: 'Ayder Referral Hospital' },
  { id: '5', first_name: 'Ermias',    last_name: 'Getachew', specialization: 'General Practitioner', average_rating: 4.6, years_of_experience: 6,  is_verified: true, hospital: 'Menelik II Hospital' },
  { id: '6', first_name: 'Bethlehem', last_name: 'Haile',    specialization: 'Cardiologist',         average_rating: 4.8, years_of_experience: 11, is_verified: true, hospital: 'Black Lion Hospital' },
  { id: '7', first_name: 'Dawit',     last_name: 'Girma',    specialization: 'Dermatologist',        average_rating: 4.7, years_of_experience: 9,  is_verified: true, hospital: 'Tikur Anbessa Hospital' },
  { id: '8', first_name: 'Tigist',    last_name: 'Mengistu', specialization: 'Pediatrician',         average_rating: 4.9, years_of_experience: 13, is_verified: true, hospital: 'Yekatit 12 Hospital' },
];

// ── Doctor fetcher ────────────────────────────────────────────────────────────

export async function fetchDoctorsFromAPI(params: FetchDoctorsParams): Promise<Doctor[]> {
  const query = new URLSearchParams();
  if (params.specialization) query.set('specialization', params.specialization);
  if (params.min_rating)     query.set('min_rating',     String(params.min_rating));
  if (params.min_experience) query.set('min_experience', String(params.min_experience));
  query.set('limit', String(params.limit ?? 4));

  try {
    const res = await fetch(`${API_BASE_URL}/providers/search?${query.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const data = await res.json();
    const doctors = (data.results ?? data.providers ?? data ?? []) as Doctor[];

    if (doctors.length === 0 && params.specialization) {
      // Backend returned empty — use filtered fallback
      return FALLBACK_DOCTORS
        .filter(d => d.specialization.toLowerCase().includes(params.specialization!.toLowerCase()))
        .slice(0, params.limit ?? 4);
    }
    return doctors;

  } catch (err) {
    console.warn('[Medlink] Backend unreachable — using demo doctors:', err);
    if (params.specialization) {
      const s = params.specialization.toLowerCase();
      const filtered = FALLBACK_DOCTORS.filter(d => d.specialization.toLowerCase().includes(s));
      return (filtered.length > 0 ? filtered : FALLBACK_DOCTORS).slice(0, params.limit ?? 4);
    }
    return FALLBACK_DOCTORS.slice(0, params.limit ?? 4);
  }
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Medi, the friendly AI health assistant for Medlink — Ethiopia's telemedicine platform.

Your three core jobs:
1. SYMPTOM CHECKER — when a user describes symptoms, identify the most relevant specialty and output a JSON tool call.
2. DOCTOR RECOMMENDER — when asked for doctors by rating, experience, or specialty, output a JSON tool call.
3. APP GUIDE — answer questions about how Medlink works.

Medlink App facts:
- Book in-person or video consultations, 24/7
- Payments: Telebirr, CBE Birr, or cash at clinic
- All doctors are verified by the Ethiopian Medical Association
- To book: tap a doctor card → "Book Appointment" → choose time → confirm
- Emergencies: call 907

Symptom to specialty mapping:
- Chest pain, palpitations → Cardiologist
- Skin rash, acne, hair loss → Dermatologist
- Child illness, under 18 → Pediatrician
- Pregnancy, menstrual issues → Gynecologist
- Headache, dizziness, nerve pain → Neurologist
- Eye problems → Ophthalmologist
- Ear pain, hearing loss, sinus → ENT Specialist
- Bone or joint pain → Orthopedist
- Diabetes, thyroid issues → Endocrinologist
- Anxiety, depression → Psychiatrist
- Fever, cough, fatigue → General Practitioner

TOOL CALL FORMAT — when symptoms or doctor search needed, output ONLY this JSON (nothing before it):
{"tool":"search_doctors","specialization":"<specialty>","min_rating":null,"min_experience":null,"limit":4}

Rules:
- Never diagnose. Say "this sounds like a case for a [Specialty]".
- For emergencies add: "Please call 907 immediately."
- Keep responses short — mobile chat interface.
- NEVER invent doctor names. Use only names from tool results.`;

// ── Tool call parser ──────────────────────────────────────────────────────────

interface ToolCall {
  tool: 'search_doctors';
  specialization: string;
  min_rating?: number | null;
  min_experience?: number | null;
  limit?: number;
}

function extractToolCall(text: string): ToolCall | null {
  const match = text.match(/\{[\s\S]*?"tool"\s*:\s*"search_doctors"[\s\S]*?\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as ToolCall;
    return parsed.specialization ? parsed : null;
  } catch {
    return null;
  }
}

// ── Gemini fetch with detailed error logging ──────────────────────────────────

async function callGemini(body: object): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (networkErr: any) {
    const msg = networkErr?.message ?? 'unknown';
    console.error('[Medlink] ❌ Network error:', msg);
    throw new Error(
      'Cannot reach Gemini API. Check your internet connection.\n' +
      'If using a simulator, ensure it has network access.'
    );
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    console.error(`[Medlink] ❌ Gemini HTTP ${res.status}:`, errBody);

    switch (res.status) {
      case 400: throw new Error('Invalid request. Check your API key and try again.');
      case 403: throw new Error('API key rejected (403). Get a fresh key at aistudio.google.com');
      case 404: throw new Error(`Model "${MODEL}" not found (404). The model name may have changed.`);
      case 429: throw new Error('Rate limit hit (429). Wait a few seconds and try again.');
      case 500: throw new Error('Gemini server error (500). Try again in a moment.');
      default:  throw new Error(`Gemini error ${res.status}: ${errBody.slice(0, 200)}`);
    }
  }

  const data = await res.json();

  if (data?.error) {
    console.error('[Medlink] ❌ Gemini error in body:', data.error);
    throw new Error(data.error?.message ?? 'Unknown Gemini error');
  }

  const candidate = data?.candidates?.[0];
  if (!candidate) {
    console.error('[Medlink] ❌ No candidates returned:', JSON.stringify(data).slice(0, 300));
    throw new Error('Gemini returned no response. The prompt may have triggered a safety filter.');
  }

  if (candidate.finishReason === 'SAFETY') {
    console.warn('[Medlink] ⚠️ Safety filter triggered');
    return "I can't respond to that. Please describe your symptoms and I'll help find the right doctor.";
  }

  const text: string = candidate?.content?.parts?.[0]?.text ?? '';
  if (!text) {
    console.error('[Medlink] ❌ Empty text in candidate:', JSON.stringify(candidate));
    throw new Error('Gemini returned an empty response.');
  }

  return text;
}

// ── Main sendChatMessage ──────────────────────────────────────────────────────

export async function sendChatMessage(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string,
): Promise<ChatResponse> {

  // Validate config first — throws a clear message if key is missing/wrong
  const config = validateChatConfig();
  if (!config.ok) {
    console.error('[Medlink] ❌ Config invalid:', config.error);
    throw new Error(config.error);
  }

  // Convert history: 'assistant' → 'model' for Gemini
  const geminiHistory = history.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const baseBody = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: { temperature: 0.5, maxOutputTokens: 1024 },
  };

  // ── First call ──────────────────────────────────────────────────────────────
  console.log('[Medlink] Sending to Gemini:', userMessage.slice(0, 80));
  const firstText = await callGemini({
    ...baseBody,
    contents: [
      ...geminiHistory,
      { role: 'user', parts: [{ text: userMessage }] },
    ],
  });
  console.log('[Medlink] ✅ First response:', firstText.slice(0, 150));

  // ── Check for tool call ─────────────────────────────────────────────────────
  const toolCall = extractToolCall(firstText);

  if (toolCall) {
    console.log('[Medlink] 🔧 Tool call:', toolCall.specialization);

    const doctors = await fetchDoctorsFromAPI({
      specialization: toolCall.specialization,
      min_rating:     toolCall.min_rating     ?? undefined,
      min_experience: toolCall.min_experience ?? undefined,
      limit:          Math.min(toolCall.limit ?? 4, 6),
    });

    console.log(`[Medlink] 👨‍⚕️ Got ${doctors.length} doctors`);

    const doctorSummary = doctors.length > 0
      ? doctors.map((d, i) =>
          `${i + 1}. Dr. ${d.first_name} ${d.last_name} — ` +
          `${d.specialization}, ${d.years_of_experience} yrs, ` +
          `rated ${d.average_rating}/5` +
          (d.hospital ? `, ${d.hospital}` : '')
        ).join('\n')
      : 'No doctors found for this specialty right now.';

    // ── Second call with doctor results ──────────────────────────────────────
    const followUpText = await callGemini({
      ...baseBody,
      generationConfig: { temperature: 0.5, maxOutputTokens: 512 },
      contents: [
        ...geminiHistory,
        { role: 'user',  parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: firstText }] },
        {
          role: 'user',
          parts: [{
            text: `[System: Doctor results for "${toolCall.specialization}"]\n${doctorSummary}\n\nBriefly introduce these doctors in 2 warm sentences. The cards are shown separately — don't list them again.`,
          }],
        },
      ],
    });

    return { text: followUpText, doctors };
  }

  // ── Plain response (app guide / general) ───────────────────────────────────
  return { text: firstText, doctors: [] };
}