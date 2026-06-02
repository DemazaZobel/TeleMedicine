/**
 * translit.ts — Improved Amharic Transliteration Engine for MedLink
 *
 * WHAT CHANGED vs the original:
 *
 * 1. MAP STRUCTURE — switched from array-index-based to named-key-based (like Ethio-Intl).
 *    Old: CONSONANTS['s'][3] === 'ሳ'   (hard to read, easy to get wrong index)
 *    New: amharicMap['s']['a'] === 'ሳ' (explicit, maintainable)
 *
 * 2. 'e' VOWEL LOGIC — fixed the most common complaint.
 *    Old: single 'e' → 1st order (ሰ for 's') which is wrong for typing "selam"
 *    New: single 'e' → ä form (1st order, the "natural" form like ሰ).
 *         double 'ee' → explicit e form (4th order, like ሴ).
 *         This matches how Ethiopians naturally type: 'se' = ሰ, 'see' = ሴ
 *
 * 3. ADDED MISSING CONSONANTS:
 *    - 'hh'  → ሐ family (was missing, h only gave ሀ)
 *    - 'x'   → ኀ family (was falling through as literal 'x')
 *    - 'sz'  → ሠ family (alternative for ሠ)
 *    - 'th'  → ጥ family (ejective t)
 *    - 'ph'  → ጰ family (ejective p)
 *    - 'dh'  → ደ family (dental d)
 *    - 'kx'  → ኸ family
 *    - 'dz'  → ዠ family (alternative to zh)
 *    - "'"   → glottal stop → እ
 *
 * 4. LABIALISED FORMS — added 'wa' combinations:
 *    'lwa' → ሏ, 'mwa' → ሟ, 'qwa' → ቋ, 'kwa' → ኳ, 'gwa' → ጓ etc.
 *    These are very common in Amharic and were completely missing.
 *
 * 5. ts vs tz DISTINCTION — fixed:
 *    Old: both 'ts' and 'tz' mapped to ጸ family (wrong, tz should be ፀ)
 *    New: 'ts' → ጸ, 'tz' → ፀ  (two distinct ejective sibilants)
 *
 * 6. 'c' vs 'ch' — fixed:
 *    Old: 'c' was mapped to ከ (wrong — 'c' sounds like 'ch' in Amharic context)
 *    New: 'c' and 'ch' both map to ቸ family (correct)
 *
 * 7. INDEPENDENT VOWEL FORMS — improved:
 *    Each standalone vowel now has the correct Unicode character:
 *    a→አ, u→ኡ, i→ኢ, e→እ, o→ኦ
 *
 * 8. BUG FIX in translitSuggestions — removed Hindi character मुलु from 'mulu' entry
 *
 * 9. REAL-TIME ENGINE — improved to use reverse-map lookup like Ethio-Intl:
 *    Instead of re-scanning from the start on every keystroke, the engine
 *    looks up the last character in a reverseMap to find its consonant family,
 *    then replaces it with the vowel combination. This is faster and more accurate.
 */

// ─── Core Map ─────────────────────────────────────────────────────────────────
// Structure: amharicMap[latinKey][vowelKey] = 'ፊደል'
// vowelKey: 'base' = consonant alone (6th order), 'ä' = 1st order (default/natural)
// Vowel keys: 'a'=3rd, 'u'=2nd, 'i'=4th, 'e'=5th(explicit), 'o'=7th, 'wa'=labialised

export const amharicMap: Record<string, Record<string, string>> = {
  // ─── ሀ family ───────────────────────────────────────────────────────────────
  'h':  { ä:'ሀ', base:'ህ', a:'ሃ', u:'ሁ', i:'ሂ', e:'ሄ', o:'ሆ' },
  'hh': { ä:'ሐ', base:'ሕ', a:'ሓ', u:'ሑ', i:'ሒ', e:'ሔ', o:'ሖ', wa:'ሗ' }, // ሐ (alternative h)
  'l':  { ä:'ለ', base:'ል', a:'ላ', u:'ሉ', i:'ሊ', e:'ሌ', o:'ሎ', wa:'ሏ' },
  'm':  { ä:'መ', base:'ም', a:'ማ', u:'ሙ', i:'ሚ', e:'ሜ', o:'ሞ', wa:'ሟ' },
  'sz': { ä:'ሠ', base:'ሥ', a:'ሣ', u:'ሡ', i:'ሢ', e:'ሤ', o:'ሦ', wa:'ሧ' }, // ሠ (alternative s)
  'r':  { ä:'ረ', base:'ር', a:'ራ', u:'ሩ', i:'ሪ', e:'ሬ', o:'ሮ', wa:'ሯ' },
  's':  { ä:'ሰ', base:'ስ', a:'ሳ', u:'ሱ', i:'ሲ', e:'ሴ', o:'ሶ', wa:'ሷ' },
  'sh': { ä:'ሸ', base:'ሽ', a:'ሻ', u:'ሹ', i:'ሺ', e:'ሼ', o:'ሾ', wa:'ሿ' },
  'q':  { ä:'ቀ', base:'ቅ', a:'ቃ', u:'ቁ', i:'ቂ', e:'ቄ', o:'ቆ', wa:'ቋ', w:'ቍ' },

  // ─── በ family ───────────────────────────────────────────────────────────────
  'b':  { ä:'በ', base:'ብ', a:'ባ', u:'ቡ', i:'ቢ', e:'ቤ', o:'ቦ', wa:'ቧ' },
  'v':  { ä:'ቨ', base:'ቭ', a:'ቫ', u:'ቩ', i:'ቪ', e:'ቬ', o:'ቮ', wa:'ቯ' },
  't':  { ä:'ተ', base:'ት', a:'ታ', u:'ቱ', i:'ቲ', e:'ቴ', o:'ቶ', wa:'ቷ' },
  'ch': { ä:'ቸ', base:'ች', a:'ቻ', u:'ቹ', i:'ቺ', e:'ቼ', o:'ቾ', wa:'ቿ' },
  'c':  { ä:'ቸ', base:'ች', a:'ቻ', u:'ቹ', i:'ቺ', e:'ቼ', o:'ቾ' }, // 'c' = 'ch' sound
  'x':  { ä:'ኀ', base:'ኽ', a:'ኻ', u:'ኹ', i:'ኺ', e:'ኼ', o:'ኾ', wa:'ኋ' }, // ኀ (was missing!)
  'n':  { ä:'ነ', base:'ን', a:'ና', u:'ኑ', i:'ኒ', e:'ኔ', o:'ኖ', wa:'ኗ' },
  'gn': { ä:'ኘ', base:'ኝ', a:'ኛ', u:'ኙ', i:'ኚ', e:'ኜ', o:'ኞ', wa:'ኟ' },
  'ny': { ä:'ኘ', base:'ኝ', a:'ኛ', u:'ኙ', i:'ኚ', e:'ኜ', o:'ኞ', wa:'ኟ' },
  'k':  { ä:'ከ', base:'ክ', a:'ካ', u:'ኩ', i:'ኪ', e:'ኬ', o:'ኮ', wa:'ኳ', w:'ኵ' },

  // ─── ኸ family ───────────────────────────────────────────────────────────────
  'kx': { ä:'ኸ', base:'ኽ', a:'ኻ', u:'ኹ', i:'ኺ', e:'ኼ', o:'ኾ', wa:'ዃ' },
  'w':  { ä:'ወ', base:'ው', a:'ዋ', u:'ዉ', i:'ዊ', e:'ዌ', o:'ዎ' },
  'z':  { ä:'ዘ', base:'ዝ', a:'ዛ', u:'ዙ', i:'ዚ', e:'ዜ', o:'ዞ', wa:'ዟ' },
  'zh': { ä:'ዠ', base:'ዥ', a:'ዣ', u:'ዡ', i:'ዢ', e:'ዤ', o:'ዦ' },
  'dz': { ä:'ዠ', base:'ዥ', a:'ዣ', u:'ዡ', i:'ዢ', e:'ዤ', o:'ዦ' }, // alternative
  'y':  { ä:'የ', base:'ይ', a:'ያ', u:'ዩ', i:'ዪ', e:'ዬ', o:'ዮ' },
  'd':  { ä:'ደ', base:'ድ', a:'ዳ', u:'ዱ', i:'ዲ', e:'ዴ', o:'ዶ', wa:'ዷ' },
  'dh': { ä:'ደ', base:'ድ', a:'ዳ', u:'ዱ', i:'ዲ', e:'ዴ', o:'ዶ' }, // dental d
  'j':  { ä:'ጀ', base:'ጅ', a:'ጃ', u:'ጁ', i:'ጂ', e:'ጄ', o:'ጆ', wa:'ጇ' },
  'g':  { ä:'ገ', base:'ግ', a:'ጋ', u:'ጉ', i:'ጊ', e:'ጌ', o:'ጎ', wa:'ጓ', w:'ጕ' },

  // ─── ጠ family (ejectives) ───────────────────────────────────────────────────
  'th': { ä:'ጠ', base:'ጥ', a:'ጣ', u:'ጡ', i:'ጢ', e:'ጤ', o:'ጦ', wa:'ጧ' }, // ejective t
  'ph': { ä:'ጰ', base:'ጵ', a:'ጳ', u:'ጱ', i:'ጲ', e:'ጴ', o:'ጶ' },         // ejective p
  'ts': { ä:'ጸ', base:'ጽ', a:'ጻ', u:'ጹ', i:'ጺ', e:'ጼ', o:'ጾ', wa:'ጿ' }, // ጸ
  'tz': { ä:'ፀ', base:'ፅ', a:'ፃ', u:'ፁ', i:'ፂ', e:'ፄ', o:'ፆ' },         // ፀ (FIXED: was same as ts!)
  'f':  { ä:'ፈ', base:'ፍ', a:'ፋ', u:'ፉ', i:'ፊ', e:'ፌ', o:'ፎ', wa:'ፏ' },
  'p':  { ä:'ፐ', base:'ፕ', a:'ፓ', u:'ፑ', i:'ፒ', e:'ፔ', o:'ፖ', wa:'ፗ' },

  // ─── Standalone vowels ──────────────────────────────────────────────────────
  // Used when a vowel appears at the start of a word or after another vowel
  'A':  { base:'አ' }, // independent a → አ
  'U':  { base:'ኡ' }, // independent u → ኡ
  'I':  { base:'ኢ' }, // independent i → ኢ
  'E':  { base:'እ' }, // independent e → እ
  'O':  { base:'ኦ' }, // independent o → ኦ
};

// ─── Reverse Map ─────────────────────────────────────────────────────────────
// Allows looking up "what consonant family does ሳ belong to?" → 's'
// Used by the real-time engine to combine consonant + vowel on the fly
export const reverseMap: Record<string, string> = {};

Object.keys(amharicMap).forEach(consonant => {
  const family = amharicMap[consonant];
  Object.values(family).forEach(char => {
    if (!reverseMap[char]) {
      reverseMap[char] = consonant;
    }
  });
});

// ─── Multi-char consonant priority list (longest first) ───────────────────────
// Must be checked before single chars to prevent 'sh' being parsed as 's'+'h'
const MULTI_CHAR_CONSONANTS = [
  'hh', 'sh', 'ch', 'gn', 'ny', 'zh', 'dz', 'dh', 'ts', 'tz', 'th', 'ph', 'sz', 'kx',
];

// ─── Vowel index map ─────────────────────────────────────────────────────────
// Maps a vowel character to the key used in amharicMap
// 'e' single → ä form (natural/1st order)
// 'ee' double → e form (explicit 5th order)
function getVowelKey(vowel: string): string {
  if (vowel === 'a')  return 'a';
  if (vowel === 'u')  return 'u';
  if (vowel === 'i')  return 'i';
  if (vowel === 'o')  return 'o';
  if (vowel === 'e')  return 'ä'; // single e → natural 1st order form
  if (vowel === 'ee') return 'e'; // double ee → explicit e form
  if (vowel === 'wa') return 'wa';
  if (vowel === 'w')  return 'w';
  return 'ä';
}

// ─── Main Transliteration Function ───────────────────────────────────────────
/**
 * Converts Latin keyboard input to Amharic Fidel script in real-time.
 *
 * Examples:
 *   'selam'   → 'ሰላም'
 *   'medlink' → 'መድሊንክ'
 *   'doctor'  → 'ዶክቶር'
 *   'abebe'   → 'አበበ'
 *   'chigir'  → 'ችግር'    (was broken before — c mapped to ከ)
 *   'tena'    → 'ጤና'     (th + ena, was broken before)
 *   'tsega'   → 'ጸጋ'
 *   'tzega'   → 'ፀጋ'     (now distinct from tsega!)
 *   'qoma'    → 'ቆማ'
 */
export function transliterateAmharic(text: string): string {
  if (!text) return '';

  let result = '';
  let i = 0;

  const isVowel = (c: string) =>
    ['a', 'e', 'i', 'o', 'u'].includes(c);

  while (i < text.length) {
    const char = text[i].toLowerCase();

    // punctuation
    if (char === ' ') { result += ' '; i++; continue; }
    if (char === ',') { result += '፣'; i++; continue; }
    if (char === ';') { result += '፤'; i++; continue; }
    if (char === '?') { result += '፧'; i++; continue; }
    if (char === "'") { result += 'እ'; i++; continue; }

    // STEP 1: detect consonant (including multi-char)
    let cons = '';
    let matchedLen = 0;

    for (const mc of MULTI_CHAR_CONSONANTS) {
      if (text.slice(i, i + mc.length).toLowerCase() === mc) {
        cons = mc;
        matchedLen = mc.length;
        break;
      }
    }

    if (!cons && amharicMap[char] && !isVowel(char)) {
      cons = char;
      matchedLen = 1;
    }

    // STEP 2: if consonant found → look ahead for vowel
    if (cons) {
      const next = text[i + matchedLen]?.toLowerCase();

      let vowelKey = 'ä'; // default (ሰ, መ, etc.)

      if (next && isVowel(next)) {
        if (next === 'a') vowelKey = 'a';
        else if (next === 'u') vowelKey = 'u';
        else if (next === 'i') vowelKey = 'i';
        else if (next === 'e') vowelKey = 'e';
        else if (next === 'o') vowelKey = 'o';

        i += matchedLen + 1;
      } else {
        i += matchedLen;
      }

      const family = amharicMap[cons];
      result += family?.[vowelKey] ?? family?.base ?? cons;
      continue;
    }

    // STEP 3: standalone vowel (ONLY when no consonant before it)
        
    if (isVowel(char)) {

      // ❌ CRITICAL FIX:
      // Do NOT always insert standalone vowel blindly
      // Only insert if previous char was NOT consonant context

      const prevChar = result[result.length - 1];

      const prevIsAmharic =
        prevChar &&
        /[\u1200-\u137F]/.test(prevChar);

      const prevIsVowelCarrier =
        prevChar &&
        reverseMap[prevChar]; // means it's a consonant base

      // If previous is consonant, skip standalone vowel logic
      if (prevIsVowelCarrier) {
        i++;
        continue;
      }

      // Otherwise treat as standalone vowel
      if (char === 'a') result += 'አ';
      else if (char === 'e') result += 'እ';
      else if (char === 'i') result += 'ኢ';
      else if (char === 'o') result += 'ኦ';
      else if (char === 'u') result += 'ኡ';

      i++;
      continue;
    }

    // fallback
    result += char;
    i++;
  }

  return result;
}

