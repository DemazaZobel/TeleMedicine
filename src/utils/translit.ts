// src/utils/translit.ts
// Final version — matches Ethio-Intl convention exactly:
//   single 'e' after consonant → ä form (se = ሰ)
//   double 'ee' after consonant → e form (see = ሴ)
//   consonant alone → base form (m = ም, s = ስ)

export const amharicMap: Record<string, Record<string, string>> = {
  'h':  { ä:'ሀ', base:'ህ', a:'ሃ', u:'ሁ', i:'ሂ', e:'ሄ', o:'ሆ' },
  'hh': { ä:'ሐ', base:'ሕ', a:'ሓ', u:'ሑ', i:'ሒ', e:'ሔ', o:'ሖ', wa:'ሗ' },
  'l':  { ä:'ለ', base:'ል', a:'ላ', u:'ሉ', i:'ሊ', e:'ሌ', o:'ሎ', wa:'ሏ' },
  'm':  { ä:'መ', base:'ም', a:'ማ', u:'ሙ', i:'ሚ', e:'ሜ', o:'ሞ', wa:'ሟ' },
  'sz': { ä:'ሠ', base:'ሥ', a:'ሣ', u:'ሡ', i:'ሢ', e:'ሤ', o:'ሦ', wa:'ሧ' },
  'r':  { ä:'ረ', base:'ር', a:'ራ', u:'ሩ', i:'ሪ', e:'ሬ', o:'ሮ', wa:'ሯ' },
  's':  { ä:'ሰ', base:'ስ', a:'ሳ', u:'ሱ', i:'ሲ', e:'ሴ', o:'ሶ', wa:'ሷ' },
  'sh': { ä:'ሸ', base:'ሽ', a:'ሻ', u:'ሹ', i:'ሺ', e:'ሼ', o:'ሾ', wa:'ሿ' },
  'q':  { ä:'ቀ', base:'ቅ', a:'ቃ', u:'ቁ', i:'ቂ', e:'ቄ', o:'ቆ', wa:'ቋ', w:'ቍ' },
  'b':  { ä:'በ', base:'ብ', a:'ባ', u:'ቡ', i:'ቢ', e:'ቤ', o:'ቦ', wa:'ቧ' },
  'v':  { ä:'ቨ', base:'ቭ', a:'ቫ', u:'ቩ', i:'ቪ', e:'ቬ', o:'ቮ', wa:'ቯ' },
  't':  { ä:'ተ', base:'ት', a:'ታ', u:'ቱ', i:'ቲ', e:'ቴ', o:'ቶ', wa:'ቷ' },
  'ch': { ä:'ቸ', base:'ች', a:'ቻ', u:'ቹ', i:'ቺ', e:'ቼ', o:'ቾ', wa:'ቿ' },
  'c':  { ä:'ቸ', base:'ች', a:'ቻ', u:'ቹ', i:'ቺ', e:'ቼ', o:'ቾ' },
  'x':  { ä:'ኀ', base:'ኽ', a:'ኻ', u:'ኹ', i:'ኺ', e:'ኼ', o:'ኾ', wa:'ኋ' },
  'n':  { ä:'ነ', base:'ን', a:'ና', u:'ኑ', i:'ኒ', e:'ኔ', o:'ኖ', wa:'ኗ' },
  'gn': { ä:'ኘ', base:'ኝ', a:'ኛ', u:'ኙ', i:'ኚ', e:'ኜ', o:'ኞ', wa:'ኟ' },
  'ny': { ä:'ኘ', base:'ኝ', a:'ኛ', u:'ኙ', i:'ኚ', e:'ኜ', o:'ኞ', wa:'ኟ' },
  'k':  { ä:'ከ', base:'ክ', a:'ካ', u:'ኩ', i:'ኪ', e:'ኬ', o:'ኮ', wa:'ኳ', w:'ኵ' },
  'kx': { ä:'ኸ', base:'ኽ', a:'ኻ', u:'ኹ', i:'ኺ', e:'ኼ', o:'ኾ', wa:'ዃ' },
  'w':  { ä:'ወ', base:'ው', a:'ዋ', u:'ዉ', i:'ዊ', e:'ዌ', o:'ዎ' },
  'z':  { ä:'ዘ', base:'ዝ', a:'ዛ', u:'ዙ', i:'ዚ', e:'ዜ', o:'ዞ', wa:'ዟ' },
  'zh': { ä:'ዠ', base:'ዥ', a:'ዣ', u:'ዡ', i:'ዢ', e:'ዤ', o:'ዦ' },
  'dz': { ä:'ዠ', base:'ዥ', a:'ዣ', u:'ዡ', i:'ዢ', e:'ዤ', o:'ዦ' },
  'y':  { ä:'የ', base:'ይ', a:'ያ', u:'ዩ', i:'ዪ', e:'ዬ', o:'ዮ' },
  'd':  { ä:'ደ', base:'ድ', a:'ዳ', u:'ዱ', i:'ዲ', e:'ዴ', o:'ዶ', wa:'ዷ' },
  'dh': { ä:'ደ', base:'ድ', a:'ዳ', u:'ዱ', i:'ዲ', e:'ዴ', o:'ዶ' },
  'j':  { ä:'ጀ', base:'ጅ', a:'ጃ', u:'ጁ', i:'ጂ', e:'ጄ', o:'ጆ', wa:'ጇ' },
  'g':  { ä:'ገ', base:'ግ', a:'ጋ', u:'ጉ', i:'ጊ', e:'ጌ', o:'ጎ', wa:'ጓ', w:'ጕ' },
  'th': { ä:'ጠ', base:'ጥ', a:'ጣ', u:'ጡ', i:'ጢ', e:'ጤ', o:'ጦ', wa:'ጧ' },
  'ph': { ä:'ጰ', base:'ጵ', a:'ጳ', u:'ጱ', i:'ጲ', e:'ጴ', o:'ጶ' },
  'ts': { ä:'ጸ', base:'ጽ', a:'ጻ', u:'ጹ', i:'ጺ', e:'ጼ', o:'ጾ', wa:'ጿ' },
  'tz': { ä:'ፀ', base:'ፅ', a:'ፃ', u:'ፁ', i:'ፂ', e:'ፄ', o:'ፆ' },
  'f':  { ä:'ፈ', base:'ፍ', a:'ፋ', u:'ፉ', i:'ፊ', e:'ፌ', o:'ፎ', wa:'ፏ' },
  'p':  { ä:'ፐ', base:'ፕ', a:'ፓ', u:'ፑ', i:'ፒ', e:'ፔ', o:'ፖ', wa:'ፗ' },
  // standalone vowels
  'a':  { base:'አ', ä:'አ' },
  'u':  { base:'ኡ', ä:'ኡ' },
  'i':  { base:'ኢ', ä:'ኢ' },
  'e':  { base:'እ', ä:'እ' },
  'o':  { base:'ኦ', ä:'ኦ' },
};

export const reverseMap: Record<string, string> = {};
Object.keys(amharicMap).forEach(cons => {
  Object.values(amharicMap[cons]).forEach(char => {
    if (!reverseMap[char]) reverseMap[char] = cons;
  });
});

const MULTI = ['hh','sh','ch','gn','ny','zh','dz','dh','ts','tz','th','ph','sz','kx'];
const VOWELS = ['a','e','i','o','u'];

/**
 * Transliterates clean Latin text to Amharic.
 *
 * Convention (matches Ethio-Intl):
 *   se  → ሰ  (single e = ä form, natural 1st order)
 *   see → ሴ  (double ee = explicit e form)
 *   sa  → ሳ, su → ሱ, si → ሲ, so → ሶ
 *   s   → ስ  (consonant alone = base/6th order)
 *
 * Examples:
 *   selam          → ሰላም
 *   ameseginalehu  → አመሰግናለሁ
 *   tena yistilign → ጤና ይስጥልኝ
 *   chigir         → ችግር
 *   tsega          → ጸጋ
 */
export function transliterateAmharic(text: string): string {
  if (!text) return '';

  let result = '';
  let i = 0;
  const len = text.length;

  while (i < len) {
    const char = text[i];
    const charLow = char.toLowerCase();

    // ── Punctuation ───────────────────────────────────────────────────────────
    if (text.slice(i, i + 2) === '::') { result += '።'; i += 2; continue; }
    if (char === ',')  { result += '፣'; i++; continue; }
    if (char === ';')  { result += '፤'; i++; continue; }
    if (char === '?')  { result += '፧'; i++; continue; }
    if (char === ' ' || char === '\n') { result += char; i++; continue; }
    if (char === "'")  { result += 'እ'; i++; continue; }

    // ── Already Amharic — pass through unchanged ──────────────────────────────
    if (char.charCodeAt(0) > 127) { result += char; i++; continue; }

    // ── Step 1: Match consonant (multi-char first, then single) ───────────────
    let cons = '';
    let consLen = 0;

    for (const mc of MULTI) {
      if (text.slice(i, i + mc.length).toLowerCase() === mc) {
        cons = mc; consLen = mc.length; break;
      }
    }

    if (!cons && amharicMap[charLow] && !VOWELS.includes(charLow)) {
      cons = charLow; consLen = 1;
    }

    // ── Step 2: Consonant found — look ahead for vowel ────────────────────────
    if (cons) {
      const afterCons = i + consLen;
      const nextChar = text[afterCons]?.toLowerCase();
      const nextNextChar = text[afterCons + 1]?.toLowerCase();

      let vowelKey = 'base'; // no vowel follows → 6th order (ስ, ም, ል...)
      let advance = consLen;

      if (nextChar && VOWELS.includes(nextChar)) {
        if (nextChar === 'e') {
          if (nextNextChar === 'e') {
            vowelKey = 'e';         // 'see' → ሴ (explicit e)
            advance = consLen + 2;
          } else {
            vowelKey = 'ä';         // 'se'  → ሰ (natural ä form)
            advance = consLen + 1;
          }
        } else {
          vowelKey = nextChar;      // a, u, i, o
          advance = consLen + 1;
        }
      }

      const family = amharicMap[cons];
      result += family[vowelKey] ?? family['base'] ?? cons;
      i += advance;
      continue;
    }

    // ── Step 3: Standalone vowel (word-initial or between vowels) ────────────
    if (VOWELS.includes(charLow)) {
      if (charLow === 'e' && text[i + 1]?.toLowerCase() === 'e') {
        result += 'እ'; i += 2;
      } else {
        result += amharicMap[charLow]?.base ?? charLow;
        i++;
      }
      continue;
    }

    // ── Fallthrough: numbers, unknown chars ───────────────────────────────────
    result += char;
    i++;
  }

  return result;
}