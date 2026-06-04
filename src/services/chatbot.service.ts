// ─── chatbot.service.ts (Groq + Medlink backend) ─────────────────────────────
// Uses Groq free API (llama-3.3-70b) + your real Medlink backend.
// Auth token is read from AsyncStorage — same place your apiClient stores it.

import * as Storage from './storage'; // adjust path if needed

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

const GROQ_API_KEY  = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
const API_BASE_URL  = 'https://medlinkethiopia.pythonanywhere.com/api';
const MODEL         = 'llama-3.3-70b-versatile';

// Must match your apiClient storage key exactly
const ACCESS_TOKEN_KEY = 'medlink_access_token';

// ── Key validator ─────────────────────────────────────────────────────────────

export function validateChatConfig(): { ok: boolean; error?: string } {
  if (!GROQ_API_KEY || GROQ_API_KEY.trim() === '') {
    return {
      ok: false,
      error:
        'GROQ_API_KEY is missing.\n' +
        '1. Go to console.groq.com\n' +
        '2. API Keys → Create API Key\n' +
        '3. Add EXPO_PUBLIC_GROQ_API_KEY=gsk_... to .env\n' +
        '4. npx expo start --clear',
    };
  }
  return { ok: true };
}

// ── Fallback demo doctors ─────────────────────────────────────────────────────
// Shown only when the backend is unreachable (e.g. no internet)

const FALLBACK_DOCTORS: Doctor[] = [
  { id: '1', first_name: 'Samuel',    last_name: 'Bekele',   specialization: 'Cardiologist',         average_rating: 4.9, years_of_experience: 12, is_verified: true, hospital: 'Zewditu Memorial Hospital' },
  { id: '2', first_name: 'Lidiya',    last_name: 'Tesfaye',  specialization: 'Pediatrician',          average_rating: 4.8, years_of_experience: 8,  is_verified: true, hospital: 'Tikur Anbessa Hospital' },
  { id: '3', first_name: 'Mulugeta',  last_name: 'Alemu',    specialization: 'Dermatologist',         average_rating: 4.7, years_of_experience: 10, is_verified: true, hospital: "St. Paul's Hospital" },
  { id: '4', first_name: 'Hana',      last_name: 'Wondimu',  specialization: 'Gynecologist',          average_rating: 4.9, years_of_experience: 15, is_verified: true, hospital: 'Ayder Referral Hospital' },
  { id: '5', first_name: 'Ermias',    last_name: 'Getachew', specialization: 'General Practitioner',  average_rating: 4.6, years_of_experience: 6,  is_verified: true, hospital: 'Menelik II Hospital' },
  { id: '6', first_name: 'Bethlehem', last_name: 'Haile',    specialization: 'Cardiologist',          average_rating: 4.8, years_of_experience: 11, is_verified: true, hospital: 'Black Lion Hospital' },
  { id: '7', first_name: 'Dawit',     last_name: 'Girma',    specialization: 'Dermatologist',         average_rating: 4.7, years_of_experience: 9,  is_verified: true, hospital: 'Tikur Anbessa Hospital' },
  { id: '8', first_name: 'Tigist',    last_name: 'Mengistu', specialization: 'Pediatrician',          average_rating: 4.9, years_of_experience: 13, is_verified: true, hospital: 'Yekatit 12 Hospital' },
];

function filterFallback(specialization?: string, limit = 4): Doctor[] {
  if (!specialization) return FALLBACK_DOCTORS.slice(0, limit);
  const s = specialization.toLowerCase();
  const filtered = FALLBACK_DOCTORS.filter(d =>
    d.specialization.toLowerCase().includes(s)
  );
  return (filtered.length > 0 ? filtered : FALLBACK_DOCTORS).slice(0, limit);
}

// ── Doctor fetcher — uses your real Medlink backend ───────────────────────────

// Maps AI-generated specialty names to values your backend actually accepts.
// Source: discovery store specializations list + your backend's filter param.
const SPECIALTY_MAP: Record<string, string> = {
  'General Practitioner': 'General',
  'Cardiologist':         'Cardiology',
  'Pediatrician':         'Pediatrics',
  'Dermatologist':        'Dermatology',
  'Neurologist':          'Neurology',
  'Orthopedist':          'Orthopedics',
  'Dentist':              'Dentistry',
  'Gynecologist':         'Gynecology',
  'Psychiatrist':         'Psychiatry',
  'Ophthalmologist':      'Ophthalmology',
  'ENT Specialist':       'ENT',
  'Endocrinologist':      'Endocrinology',
};

export async function fetchDoctorsFromAPI(params: FetchDoctorsParams): Promise<Doctor[]> {
  const limit = params.limit ?? 4;

  // Map AI specialty name → backend value, e.g. "Cardiologist" → "Cardiology"
  const mappedSpec = params.specialization
    ? (SPECIALTY_MAP[params.specialization] ?? params.specialization)
    : null;

  // Skip specialization filter for generic queries — just return all doctors
  const isGeneric = !mappedSpec || mappedSpec.toLowerCase() === 'general';

  console.log('[Medlink chatbot] Specialty:', params.specialization, '→', mappedSpec, isGeneric ? '(generic — no filter)' : '');

  const query = new URLSearchParams();
  if (mappedSpec && !isGeneric) query.set('specialization', mappedSpec);
  if (params.min_rating)        query.set('min_rating',     String(params.min_rating));
  if (params.min_experience)    query.set('sort_by',        'experience_desc');
  query.set('page', '1');

  // Read Bearer token from AsyncStorage — same key as apiClient
  let token: string | null = null;
  try {
    token = await Storage.getItemAsync(ACCESS_TOKEN_KEY);
    if (token) console.log('[Medlink chatbot] ✅ Auth token found');
    else        console.warn('[Medlink chatbot] ⚠️  No auth token — sending unauthenticated request');
  } catch {
    console.warn('[Medlink chatbot] Could not read auth token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const endpoint = `${API_BASE_URL}/providers/search/?${query.toString()}`;
  console.log('[Medlink chatbot] Fetching:', endpoint);

  try {
    const res = await fetch(endpoint, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn(`[Medlink chatbot] HTTP ${res.status}:`, body.slice(0, 200));
      return filterFallback(params.specialization, limit);
    }

    const data = await res.json();
    console.log('[Medlink chatbot] ✅ Raw response:', JSON.stringify(data).slice(0, 400));

    // Django REST Framework paginates as { count, next, previous, results: [...] }
    const raw: any[] = data?.results ?? (Array.isArray(data) ? data : []);

    if (raw.length === 0 && mappedSpec && !isGeneric) {
      // Specialty filter returned nothing — retry without it to get any doctors
      console.warn('[Medlink chatbot] No results for specialty "' + mappedSpec + '" — retrying without filter');
      return fetchDoctorsFromAPI({ ...params, specialization: undefined });
    }

    if (raw.length === 0) {
      console.warn('[Medlink chatbot] Backend returned 0 results — using fallback');
      return filterFallback(params.specialization, limit);
    }

    // Map fields — using exact names from ProviderSearchResult in doctor.types.ts
    // current_working_hospital is the field name your backend uses for hospital
    const doctors: Doctor[] = raw.map((d: any) => ({
      id:                  String(d.id ?? Math.random()),
      first_name:          d.first_name  ?? d.user?.first_name  ?? 'Unknown',
      last_name:           d.last_name   ?? d.user?.last_name   ?? '',
      specialization:      d.specialization ?? 'General Practitioner',
      average_rating:      Number(d.average_rating ?? 0),
      years_of_experience: Number(d.years_of_experience ?? 0),
      is_verified:         Boolean(d.is_verified ?? false),
      hospital:            d.current_working_hospital ?? d.hospital ?? undefined,
      profile_image:       d.profile_image ?? d.photo ?? undefined,
    }));

    return doctors.slice(0, limit);

  } catch (err: any) {
    console.warn('[Medlink chatbot] Fetch failed:', err?.message);
    return filterFallback(params.specialization, limit);
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

Symptom to specialty mapping (use EXACTLY these specialization values):
- Chest pain, palpitations, shortness of breath → Cardiologist
- Skin rash, acne, hair loss, nail issues → Dermatologist
- Child illness, patient under 18 → Pediatrician
- Pregnancy, menstrual issues, reproductive health → Gynecologist
- Headache, dizziness, nerve pain, memory issues → Neurologist
- Eye problems, vision changes → Ophthalmologist
- Ear pain, hearing loss, sinus problems → ENT Specialist
- Bone or joint pain, fractures → Orthopedist
- Diabetes, thyroid, hormonal issues → Endocrinologist
- Anxiety, depression, mental health → Psychiatrist
- Teeth, gum, dental issues → Dentist
- Fever, cough, fatigue, general illness, or no specific symptoms → General Practitioner
- When user asks for "most experienced", "best", "top doctor" with no symptoms → General Practitioner

TOOL CALL INSTRUCTIONS:
When the user describes symptoms OR asks for a doctor (including "most experienced", "best rated", "find me a doctor"), output ONLY this JSON with no text before or after it:
{"tool":"search_doctors","specialization":"<specialty>","min_rating":null,"min_experience":null,"limit":4}

IMPORTANT rules for the JSON:
- "specialization" is REQUIRED — NEVER set it to null. If the user asks generally ("best doctor", "most experienced"), use "General Practitioner".
- Set "min_experience" to 10 only if user says "experienced" or "senior".
- Set "min_rating" to 4.5 only if user says "top rated" or "best".
- After receiving doctor results, respond warmly in 2-3 sentences. Do not list doctors — cards are shown in the UI.

Rules:
- NEVER diagnose. Say "this sounds like a case for a [Specialty]".
- For emergencies add: "Please call 907 immediately."
- Keep responses short and warm — mobile chat interface.
- NEVER make up doctor names. Only use names from tool results.`;

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
    // Fallback: if specialization is null, use General Practitioner
    if (!parsed.specialization || parsed.specialization === "null") {
      parsed.specialization = "General Practitioner";
    }
    return parsed;
  } catch {
    return null;
  }
}

// ── Groq fetch ────────────────────────────────────────────────────────────────

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callGroq(messages: GroqMessage[], maxTokens = 1024): Promise<string> {
  let res: Response;
  try {
    res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.5, max_tokens: maxTokens }),
    });
  } catch (networkErr: any) {
    throw new Error('Cannot reach Groq. Check your internet connection.');
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    switch (res.status) {
      case 401: throw new Error('Invalid Groq API key. Get a fresh one at console.groq.com → API Keys.');
      case 429: throw new Error('Rate limit hit. Wait a moment and try again.');
      default:  throw new Error(`Groq error ${res.status}: ${body.slice(0, 200)}`);
    }
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error('Groq returned an empty response.');
  return text;
}

// ── Main sendChatMessage ──────────────────────────────────────────────────────

export async function sendChatMessage(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string,
): Promise<ChatResponse> {

  const config = validateChatConfig();
  if (!config.ok) throw new Error(config.error);

  const messages: GroqMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user',   content: userMessage },
  ];

  console.log('[Medlink chatbot] → Groq:', userMessage.slice(0, 80));
  const firstText = await callGroq(messages);
  console.log('[Medlink chatbot] ← Groq:', firstText.slice(0, 150));

  const toolCall = extractToolCall(firstText);

  if (toolCall) {
    console.log('[Medlink chatbot] 🔧 Searching:', toolCall.specialization);

    const doctors = await fetchDoctorsFromAPI({
      specialization: toolCall.specialization,
      min_rating:     toolCall.min_rating     ?? undefined,
      min_experience: toolCall.min_experience ?? undefined,
      limit:          Math.min(toolCall.limit ?? 4, 6),
    });

    const doctorSummary = doctors.length > 0
      ? doctors.map((d, i) =>
          `${i + 1}. Dr. ${d.first_name} ${d.last_name} — ` +
          `${d.specialization}, ${d.years_of_experience} yrs, ` +
          `rated ${d.average_rating}/5` +
          (d.hospital ? `, at ${d.hospital}` : '')
        ).join('\n')
      : 'No doctors found for this specialty right now.';

    const followUpText = await callGroq([
      ...messages,
      { role: 'assistant', content: firstText },
      {
        role: 'user',
        content:
          `[System: Doctor results for "${toolCall.specialization}"]\n${doctorSummary}\n\n` +
          `Warmly introduce these doctors in 2 sentences. Cards are shown in the UI — don't list them again.`,
      },
    ], 512);

    return { text: followUpText, doctors };
  }

  return { text: firstText, doctors: [] };
}