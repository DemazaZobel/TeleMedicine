/**
 * translitSuggestions.ts — Improved suggestion engine for MedLink
 *
 * CHANGES vs original:
 * 1. Fixed Hindi character bug in 'mulu' entry (was: 'मुलु', now: 'ሙሉ')
 * 2. Added more medical terms relevant to MedLink
 * 3. Added common doctor specializations in Amharic
 * 4. Added Ethiopian city names used in doctor profiles
 * 5. Improved suggestion ordering — direct transliteration is always first
 */

import { transliterateAmharic } from './translit';

const DICTIONARY: Record<string, string[]> = {
  // ─── Common Ethiopian Names ──────────────────────────────────────────────
  'abeb': ['አበበ', 'አበበች', 'አበባ', 'አበቤ'],
  'kebe': ['ከበደ', 'ከበቡሽ', 'ከበደች'],
  'alem': ['አለሙ', 'አለም', 'ዓለም', 'አለማየሁ'],
  'tesf': ['ተስፋዬ', 'ተስፋ', 'ተስፋነሽ', 'ተስፋማርያም'],
  'dawi': ['ዳዊት', 'ዳውድ'],
  'tigi': ['ትዕግስት', 'ትግስት', 'ትዕግስቴ'],
  'samu': ['ሳሙኤል', 'ሳሚ'],
  'yare': ['ያሬድ', 'ያሪ'],
  'hana': ['ሀና', 'ሐና', 'ሃና'],
  'mulu': ['ሙሉ', 'ሙሉጌታ', 'ሙሉነህ'],  // FIXED: was 'मुलु' (Hindi char!)
  'lidi': ['ሊዲያ', 'ሊድያ'],
  'ermi': ['ኤርሚያስ', 'ኤርሚ'],
  'beth': ['ቤተልሔም', 'ቤቲ', 'ቤተልሄም'],
  'bete': ['ቤተልሔም', 'ቤቲ'],
  'selam': ['ሰላም', 'ሰላምነሽ'],
  'biruk': ['ብሩክ', 'ብሩክነሽ'],
  'haben': ['ሓበን', 'ሃበን'],
  'yorda': ['ዮርዳኖስ', 'ዮርዳ'],
  'mihre': ['ምህረት', 'ምህረቴ'],

  // ─── Ethiopian Cities ─────────────────────────────────────────────────────
  'addi': ['አዲስ አበባ', 'አዲግራት', 'አዲስ'],
  'hawa': ['ሐዋሳ', 'ሃዋሳ'],
  'bahi': ['ባሕር ዳር', 'ባህር ዳር'],
  'gond': ['ጎንደር'],
  'adam': ['አዳማ', 'አዳም'],
  'meke': ['መቀሌ', 'መቀለ'],
  'dire': ['ድሬዳዋ', 'ድሬ'],
  'jimm': ['ጅማ', 'ጂማ'],
  'bish': ['ቢሾፍቱ'],
  'nekm': ['ነቀምት', 'ነቅምት'],
  'arba': ['አርባ ምንጭ'],
  'dese': ['ደሴ'],
  'jijj': ['ጂጂጋ'],

  // ─── Medical Terms (critical for MedLink) ─────────────────────────────────
  'heme': ['ህመም', 'ሕመም', 'ህመምተኛ'],
  'medh': ['መድኃኒት', 'መድሀኒት', 'መድኃኒቶች'],
  'haki': ['ሐኪም', 'ሃኪም', 'ሐኪሞች', 'ሕክምና'],
  'kurt': ['ቁርጠት', 'ቁርጥማት'],
  'teqm': ['ተቅማጥ'],
  'gunf': ['ጉንፋን'],
  'rasm': ['ራስ ምታት'],
  'demg': ['ደም ግፊት', 'ደም'],
  'lebh': ['ልብ ህመም', 'ልብ ምት', 'ልብ'],
  'sika': ['ስኳር', 'ስኳር ህመም', 'ስኳር በሽታ'],
  'kete': ['ቀጠሮ', 'ቀጠሮዎች'],
  'tena': ['ጤና', 'ጤናማ', 'ጤንነት'],
  'chig': ['ችግር', 'ችግሮች'],
  'shin': ['ሽንት', 'ሽንፈት'],
  'wuba': ['ወባ', 'ወባ በሽታ'],
  'besh': ['በሽታ', 'በሽተኛ'],
  'oper': ['ቀዶ ጥገና', 'ቀዶ ሕክምና'],
  'tsna': ['ጽናት'],
  'nurs': ['ነርስ', 'ነርሶች'],
  'hospi': ['ሆስፒታል', 'ሆስፒታሎች'],
  'clini': ['ክሊኒክ', 'ክሊኒኮች'],

  // ─── Doctor Specializations ───────────────────────────────────────────────
  'gyne': ['የማህፀን ሐኪም', 'ማህፀን', 'ጋይኒኮሎጂ'],
  'card': ['የልብ ሐኪም', 'ልብ', 'ካርዲዮሎጂ'],
  'derm': ['የቆዳ ሐኪም', 'ቆዳ', 'ደርማቶሎጂ'],
  'pedi': ['የህፃናት ሐኪም', 'ህፃናት', 'ፔዲያትሪክስ'],
  'orth': ['የአጥንት ሐኪም', 'አጥንት', 'ኦርቶፔዲክስ'],
  'neur': ['የነርቭ ሐኪም', 'ነርቭ', 'ኒውሮሎጂ'],
  'opht': ['የዓይን ሐኪም', 'ዓይን', 'ኦፍታልሞሎጂ'],
  'dent': ['ጥርስ ሐኪም', 'ጥርስ', 'ደንቲስት'],
  'psyc': ['የአዕምሮ ሐኪም', 'ሳይካይትሪ', 'ሥነ ልቦና'],
  'surg': ['ቀዶ ጠራቢ', 'ቀዶ ሕክምና', 'ሰርጀሪ'],
  'endo': ['ኤንዶክሪኖሎጂ', 'የስኳር ሐኪም'],
  'neph': ['የኩላሊት ሐኪም', 'ኩላሊት', 'ኔፍሮሎጂ'],
  'onco': ['የካንሰር ሐኪም', 'ካንሰር', 'ኦንኮሎጂ'],
  'pul':  ['የሳምባ ሐኪም', 'ሳምባ', 'ፑልሞኖሎጂ'],
  'rheu': ['የጅማት ሐኪም', 'ሩማቶሎጂ'],
  'uro':  ['የሽንት ቧንቧ ሐኪም', 'ዩሮሎጂ'],

  // ─── Appointment related ──────────────────────────────────────────────────
  'eket': ['ቀጠሮ', 'ቀጠሮ ይያዙ'],
  'nati': ['ናቲ', 'ናቲ ቀጠሮ'],
  'onli': ['በቴሌፎን', 'ኦንላይን'],
  'inpe': ['対面', '対面診察'],
  'reaso': ['ምክንያት', 'የህክምና ምክንያት'],
};

/**
 * Returns a list of transliteration suggestions for the currently typed Latin word.
 *
 * The first suggestion is always the direct phonetic transliteration.
 * Subsequent suggestions come from the context dictionary (names, medical terms, etc.)
 *
 * Example:
 *   getTranslitSuggestions('selam') → ['ሰላም', 'ሰላምነሽ']
 *   getTranslitSuggestions('haki')  → ['ሃኪ', 'ሐኪም', 'ሃኪም', 'ሐኪሞች', 'ሕክምና']
 *   getTranslitSuggestions('card')  → ['ካርድ', 'የልብ ሐኪም', 'ልብ', 'ካርዲዮሎጂ']
 */
export function getTranslitSuggestions(word: string): string[] {
  if (!word) return [];

  const wordLower = word.toLowerCase().trim();

  // 1. Direct phonetic transliteration is always first
  const directTrans = transliterateAmharic(wordLower);
  const suggestions = new Set<string>();
  suggestions.add(directTrans);

  // 2. Find context-aware dictionary matches
  for (const prefix in DICTIONARY) {
    if (wordLower.startsWith(prefix) || prefix.startsWith(wordLower)) {
      DICTIONARY[prefix].forEach(s => suggestions.add(s));
    }
  }

  return Array.from(suggestions);
}