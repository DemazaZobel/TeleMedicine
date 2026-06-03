// ─── Medlink Chatbot Service (Gemini — Free Tier) ────────────────────────────
// Uses Google's free Gemini 1.5 Flash API.
// Get a free key at: https://aistudio.google.com  (no credit card needed)
// Add to your .env:  EXPO_PUBLIC_GEMINI_API_KEY=your_key_here

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
  
  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
  const API_BASE_URL   = process.env.EXPO_PUBLIC_API_BASE_URL  ?? 'https://api.medlink.et';
  
  // Free Gemini models (pick one):
  //   gemini-1.5-flash   ← fast, free, recommended
  //   gemini-1.5-pro     ← smarter but lower free quota
  const MODEL = 'gemini-1.5-flash';
  
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
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      return (data.results ?? data.providers ?? data ?? []) as Doctor[];
    } catch (err) {
      console.warn('[Medlink chatbot] doctor fetch failed:', err);
      return [];
    }
  }
  
  // ── System prompt ─────────────────────────────────────────────────────────────
  
  const SYSTEM_PROMPT = `You are Medi, the friendly AI health assistant for Medlink — Ethiopia's telemedicine platform.
  
  Your three core jobs:
  1. SYMPTOM CHECKER — when a user describes symptoms, identify the most relevant medical specialty and output a JSON tool call to search for doctors.
  2. DOCTOR RECOMMENDER — when a user asks for doctors by rating, experience, or specialty, output a JSON tool call with the right filters.
  3. APP GUIDE — answer questions about how Medlink works.
  
  Medlink App Guide facts:
  - Users can book in-person or video consultations
  - Appointments can be booked 24/7; doctors respond within 1 hour
  - Payments: Telebirr, CBE Birr, or cash at clinic
  - All doctors are verified by the Ethiopian Medical Association
  - Prescriptions from video consultations are valid across Ethiopia
  - To book: tap a doctor card → "Book Appointment" → choose time → confirm
  - For emergencies, always direct users to call 907 (Ethiopian emergency line)
  
  Symptom to specialty mapping:
  - Chest pain, palpitations, shortness of breath → Cardiologist
  - Skin rash, acne, hair loss, nail issues → Dermatologist
  - Child illness, any patient under 18 → Pediatrician
  - Pregnancy, menstrual issues, reproductive health → Gynecologist
  - Headache, dizziness, nerve pain, memory issues → Neurologist
  - Eye problems, vision changes → Ophthalmologist
  - Ear pain, hearing loss, sinus problems → ENT Specialist
  - Bone pain, joint issues, fractures → Orthopedist
  - Diabetes, thyroid, hormonal issues → Endocrinologist
  - Anxiety, depression, mental health → Psychiatrist
  - General illness, fever, cough, fatigue → General Practitioner
  
  TOOL CALL INSTRUCTIONS:
  When the user describes symptoms OR asks for a doctor recommendation, you MUST output ONLY this JSON (no extra text before it):
  {"tool":"search_doctors","specialization":"<specialty>","min_rating":<number or null>,"min_experience":<number or null>,"limit":4}
  
  After receiving doctor results, respond warmly in 2-3 sentences introducing the doctors.
  
  Important rules:
  - Never diagnose. Say "this sounds like a case for a [Specialty]" not "you have X disease".
  - For serious/emergency symptoms add: "For emergencies, please call 907 immediately."
  - Keep responses short and warm — this is a mobile chat interface.
  - Do NOT make up doctor names. Only use names from the tool results.`;
  
  // ── Helper: detect tool call in model response ────────────────────────────────
  
  interface ToolCall {
    tool: 'search_doctors';
    specialization: string;
    min_rating?: number;
    min_experience?: number;
    limit?: number;
  }
  
  function extractToolCall(text: string): ToolCall | null {
    // Look for JSON anywhere in the response
    const match = text.match(/\{[\s\S]*?"tool"\s*:\s*"search_doctors"[\s\S]*?\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as ToolCall;
    } catch {
      return null;
    }
  }
  
  // ── Main chat function ────────────────────────────────────────────────────────
  
  export async function sendChatMessage(
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string,
  ): Promise<ChatResponse> {
    // Build Gemini conversation format
    // Gemini uses 'user' and 'model' roles (not 'assistant')
    const geminiHistory = history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
  
    const requestBody = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        ...geminiHistory,
        { role: 'user', parts: [{ text: userMessage }] },
      ],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1024,
      },
    };
  
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
    // ── First call ──────────────────────────────────────────────────────────────
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${errText}`);
    }
  
    const data = await res.json();
    const firstText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  
    // ── Check if model wants to call the search_doctors tool ───────────────────
    const toolCall = extractToolCall(firstText);
  
    if (toolCall) {
      // Fetch real doctors from your backend
      const doctors = await fetchDoctorsFromAPI({
        specialization: toolCall.specialization,
        min_rating:     toolCall.min_rating     ?? undefined,
        min_experience: toolCall.min_experience ?? undefined,
        limit:          Math.min(toolCall.limit ?? 4, 6),
      });
  
      const doctorSummary =
        doctors.length > 0
          ? doctors
              .map(
                (d, i) =>
                  `${i + 1}. Dr. ${d.first_name} ${d.last_name} — ` +
                  `${d.specialization}, ` +
                  `${d.years_of_experience} yrs experience, ` +
                  `rated ${d.average_rating}/5` +
                  (d.hospital ? `, at ${d.hospital}` : ''),
              )
              .join('\n')
          : 'No doctors found matching these criteria right now.';
  
      // ── Second call: give model the doctor results ────────────────────────
      const followUpBody = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          ...geminiHistory,
          { role: 'user',  parts: [{ text: userMessage }] },
          { role: 'model', parts: [{ text: firstText }] },
          {
            role: 'user',
            parts: [{
              text: `[Doctor search results for "${toolCall.specialization}"]\n${doctorSummary}\n\nPlease introduce these doctors to the user warmly in 2-3 sentences.`,
            }],
          },
        ],
        generationConfig: { temperature: 0.5, maxOutputTokens: 512 },
      };
  
      const followUpRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUpBody),
      });
  
      const followUpData = await followUpRes.json();
      const followUpText: string =
        followUpData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  
      return { text: followUpText || firstText, doctors };
    }
  
    // ── Plain response (app guide / general question) ───────────────────────
    return { text: firstText, doctors: [] };
  }