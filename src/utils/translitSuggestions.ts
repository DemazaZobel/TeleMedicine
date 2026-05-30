import { transliterateAmharic } from './translit';

// A context-aware prefix dictionary mapping typed prefixes to natural Amharic word completions
const DICTIONARY: Record<string, string[]> = {
  // Common names
  'abeb': ['አበበ', 'አበበች', 'አበባ', 'አበቤ'],
  'kebe': ['ከበደ', 'ከበቡሽ', 'ከበደች'],
  'alem': ['አለሙ', 'አለም', 'ዓለም', 'አለማየሁ'],
  'tesf': ['ተስፋዬ', 'ተስፋ', 'ተስፋነሽ', 'ተስፋማርያም'],
  'dawi': ['ዳዊት', 'ዳውድ', 'ዳዊቶች'],
  'tigi': ['ትዕግስት', 'ትግስት', 'ትዕግስቴ'],
  'samu': ['ሳሙኤል', 'ሳሚ'],
  'yare': ['ያሬድ', 'ያሪ'],
  'hana': ['ሀና', 'ሐና', 'ሃና'],
  'mulu': ['मुलु', 'ሙሉጌታ', 'ሙሉ', 'ሙሉነህ'],
  'lidi': ['ሊዲያ', 'ሊድያ'],
  'ermi': ['ኤርሚያስ', 'ኤርሚ'],
  'beth': ['ቤተልሔም', 'ቤቲ', 'ቤተልሄም'],
  
  // Ethiopian places
  'addi': ['አዲስ አበባ', 'አዲግራት', 'አዲስ'],
  'hawa': ['ሐዋሳ', 'ሃዋሳ', 'ሐዋሳዎች'],
  'bahi': ['ባሕር ዳር', 'ባህር ዳር', 'ባህርዳር'],
  'gond': ['ጎንደር', 'ጎንደሬ'],
  'adam': ['አዳማ', 'አዳም', 'አዳምነህ'],
  'meke': ['መቀሌ', 'መቀለ', 'መቀሌዎች'],
  'dire': ['ድሬዳዋ', 'ድሬ', 'ድሬዎች'],
  'jimm': ['ጅማ', 'ጂማ', 'ጅማዎች'],
  'bish': ['ቢሾፍቱ', 'ቢሾፍቱዎች'],
  
  // Medical & Health Terms
  'heme': ['ህመም', 'ሕመም', 'ህመምተኛ', 'ህመሞች'],
  'medh': ['መድኃኒት', 'መድሀኒት', 'መድኃኒቶች', 'መድሀኒቶች'],
  'haki': ['ሐኪም', 'ሃኪም', 'ሐኪሞች', 'ሕክምና', 'ሀኪም'],
  'kurt': ['ቁርጠት', 'ቁርጥማት', 'ቁርጥማቶች'],
  'teqm': ['ተቅማጥ', 'ተቅማጦች'],
  'gunf': ['ጉንፋን', 'ጉንፋኖች'],
  'rasm': ['ራስ ምታት', 'ራስ ምታት ህመም'],
  'demg': ['ደም ግፊት', 'ደም'],
  'lebh': ['ልብ ህመም', 'ልብ ምት', 'ልብ'],
  'sika': ['ስኳር', 'ስኳር ህመም', 'ስኳር በሽታ'],
  'kete': ['ቀጠሮ', 'ቀጠሮዎች', 'ቀጠሮ መያዝ'],
  'wuka': ['ውቃቢ', 'ውቃቤ'],
  'tena': ['ጤና', 'ጤናማ', 'ጤንነት', 'ጤናሽን'],
  'misa': ['ምግብ', 'ምግቦች'],
  'chig': ['ችግር', 'ችግሮች'],
  'shin': ['ሽንፈት', 'ሽንት'],
  'gyne': ['የማህፀን ሐኪም', 'ማህፀን'],
  'card': ['የልብ ሐኪም', 'ልብ'],
  'derm': ['የቆዳ ሐኪም', 'ቆዳ'],
  'pedi': ['የህፃናት ሐኪም', 'ህፃናት'],
};

/**
 * Returns a list of context-aware transliteration suggestions for a typed Latin word.
 * Similar to Google Input Tools, the first suggestion is the direct phonetic transliteration,
 * followed by dictionary-matched completions.
 */
export function getTranslitSuggestions(word: string): string[] {
  if (!word) return [];
  
  const wordLower = word.toLowerCase().trim();
  
  // 1. Get the direct phonetic transliteration
  const directTrans = transliterateAmharic(wordLower);
  
  const suggestions = new Set<string>();
  suggestions.add(directTrans);
  
  // 2. Find context-aware matches based on prefix
  for (const prefix in DICTIONARY) {
    if (wordLower.startsWith(prefix)) {
      DICTIONARY[prefix].forEach(sug => {
        suggestions.add(sug);
      });
    }
  }
  
  return Array.from(suggestions);
}
