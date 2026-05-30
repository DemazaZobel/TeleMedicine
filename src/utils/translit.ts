const CONSONANTS: Record<string, string[]> = {
  'h': ['ሀ', 'ሁ', 'ሂ', 'ሃ', 'ሄ', 'ህ', 'ሆ'],
  'l': ['ለ', 'ሉ', 'ሊ', 'ላ', 'ሌ', 'ል', 'ሎ'],
  'm': ['መ', 'ሙ', 'ሚ', 'ማ', 'ሜ', 'ም', 'ሞ'],
  'r': ['ረ', 'ሩ', 'ሪ', 'ራ', 'ሬ', 'ር', 'ሮ'],
  's': ['ሰ', 'ሱ', 'ሲ', 'ሳ', 'ሴ', 'ስ', 'ሶ'],
  'sh': ['ሸ', 'ሹ', 'ሺ', 'ሻ', 'ሼ', 'ሽ', 'ሾ'],
  'q': ['ቀ', 'ቁ', 'ቂ', 'ቃ', 'ቄ', 'ቅ', 'ቆ'],
  'b': ['በ', 'ቡ', 'ቢ', 'ባ', 'ቤ', 'ብ', 'ቦ'],
  't': ['ተ', 'ቱ', 'ቲ', 'ታ', 'ቴ', 'ት', 'ቶ'],
  'ch': ['ቸ', 'ቹ', 'ቺ', 'ቻ', 'ቼ', 'ች', 'ቾ'],
  'n': ['ነ', 'ኑ', 'ኒ', 'ና', 'ኔ', 'ን', 'ኖ'],
  'gn': ['ኘ', 'ኙ', 'ኚ', 'ኛ', 'ኜ', 'ኝ', 'ኞ'],
  'ny': ['ኘ', 'ኙ', 'ኚ', 'ኛ', 'ኜ', 'ኝ', 'ኞ'],
  'k': ['ከ', 'ኩ', 'ኪ', 'ካ', 'ኬ', 'ክ', 'ኮ'],
  'c': ['ከ', 'ኩ', 'ኪ', 'ካ', 'ኬ', 'ክ', 'ኮ'],
  'w': ['ወ', 'ዉ', 'ዊ', 'ዋ', 'ዌ', 'ው', 'ዎ'],
  'z': ['ዘ', 'ዙ', 'ዚ', 'ዛ', 'ዜ', 'ዝ', 'ዞ'],
  'zh': ['ዠ', 'ዡ', 'ዢ', 'ዣ', 'ዤ', 'ዥ', 'ዦ'],
  'y': ['የ', 'ዩ', 'ዪ', 'ያ', 'ዬ', 'ይ', 'ዮ'],
  'd': ['ደ', 'ዱ', 'ዲ', 'ዳ', 'ዴ', 'ድ', 'ዶ'],
  'j': ['ጀ', 'ጁ', 'ጂ', 'ጃ', 'ጄ', 'ጅ', 'ጆ'],
  'g': ['ገ', 'ጉ', 'ጊ', 'ጋ', 'ጌ', 'ግ', 'ጎ'],
  'ts': ['ጸ', 'ጹ', 'ጺ', 'ጻ', 'ጼ', 'ጽ', 'ጾ'],
  'tz': ['ጸ', 'ጹ', 'ጺ', 'ጻ', 'ጼ', 'ጽ', 'ጾ'],
  'f': ['ፈ', 'ፉ', 'ፊ', 'ፋ', 'ፌ', 'ፍ', 'ፎ'],
  'p': ['ፐ', 'ፑ', 'ፒ', 'ፓ', 'ፔ', 'ፕ', 'ፖ'],
  'v': ['ቨ', 'ቩ', 'ቪ', 'ቫ', 'ቬ', 'ቭ', 'ቮ'],
};

const VOWELS: Record<string, string[]> = {
  '': ['አ', 'ኡ', 'ኢ', 'አ', 'ኤ', 'እ', 'ኦ']
};

/**
 * Transliterates English (QWERTY) Latin keyboard inputs into Amharic (Ethiopic) characters in real-time.
 * e.g., 'selam' -> 'ሰላም', 'medlink' -> 'መድሊንክ', 'doctor' -> 'ዶክቶር', 'abebe' -> 'አበበ'.
 */
export function transliterateAmharic(text: string): string {
  if (!text) return '';
  
  let result = '';
  let i = 0;
  const len = text.length;
  
  while (i < len) {
    // 1. Check for Amharic punctuation
    if (text.startsWith('::', i)) {
      result += '።';
      i += 2;
      continue;
    }
    const char = text[i];
    if (char === ',') {
      result += '፣';
      i += 1;
      continue;
    }
    if (char === ';') {
      result += '፤';
      i += 1;
      continue;
    }
    if (char === '?') {
      result += '፧';
      i += 1;
      continue;
    }
    
    // 2. Check for multi-character consonants
    let cons = '';
    if (i + 1 < len) {
      const doubleChars = text.slice(i, i + 2).toLowerCase();
      if (['sh', 'ch', 'gn', 'ny', 'zh', 'ts', 'tz'].includes(doubleChars)) {
        cons = doubleChars;
        i += 2;
      }
    }
    
    // 3. Check for single-character consonant
    if (!cons) {
      const singleChar = char.toLowerCase();
      if (singleChar in CONSONANTS) {
        cons = singleChar;
        i += 1;
      }
    }
    
    // If a consonant was found (or if we treat independent vowels as cons = '')
    if (cons) {
      // Check for vowel following the consonant
      let vowel = '';
      if (i < len) {
        // Multi-char vowel check
        if (i + 1 < len) {
          const doubleVow = text.slice(i, i + 2).toLowerCase();
          if (['ie', 'ee', 'ey'].includes(doubleVow)) {
            vowel = doubleVow;
            i += 2;
          }
        }
        
        // Single-char vowel check
        if (!vowel) {
          const singleVow = text[i].toLowerCase();
          if (['a', 'u', 'i', 'e', 'o'].includes(singleVow)) {
            vowel = singleVow;
            i += 1;
          }
        }
      }
      
      // Map to Amharic Fidel
      const forms = CONSONANTS[cons];
      let vowelIdx = 5; // Default: 6th form (consonant only)
      
      if (vowel) {
        if (vowel === 'u') vowelIdx = 1;
        else if (vowel === 'i') vowelIdx = 2;
        else if (vowel === 'a') vowelIdx = 3;
        else if (['ie', 'ee', 'ey'].includes(vowel)) vowelIdx = 4;
        else if (vowel === 'e') vowelIdx = 0;
        else if (vowel === 'o') vowelIdx = 6;
      }
      
      result += forms[vowelIdx];
    } else {
      // 4. No consonant found. Check if it's an independent vowel
      const charLower = char.toLowerCase();
      let vowel = '';
      
      if (i + 1 < len) {
        const doubleVow = text.slice(i, i + 2).toLowerCase();
        if (['ie', 'ee', 'ey'].includes(doubleVow)) {
          vowel = doubleVow;
          i += 2;
        }
      }
      
      if (!vowel && ['a', 'u', 'i', 'e', 'o'].includes(charLower)) {
        vowel = charLower;
        i += 1;
      }
      
      if (vowel) {
        const forms = VOWELS[''];
        let vowelIdx = 5;
        if (vowel === 'u') vowelIdx = 1;
        else if (vowel === 'i') vowelIdx = 2;
        else if (vowel === 'a') vowelIdx = 3;
        else if (['ie', 'ee', 'ey'].includes(vowel)) vowelIdx = 4;
        else if (vowel === 'e') vowelIdx = 0;
        else if (vowel === 'o') vowelIdx = 6;
        
        result += forms[vowelIdx];
      } else {
        // Just append the character as-is (numbers, spaces, Amharic chars, punctuation, etc.)
        result += char;
        i += 1;
      }
    }
  }
  
  return result;
}
