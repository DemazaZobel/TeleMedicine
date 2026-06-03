// src/hooks/useAmharicInput.ts
// Matches Ethio-Intl's useTransliterate approach, adapted for React Native.
// Uses per-keystroke reverse lookup instead of full-string re-scan.

import { useState, useRef, useCallback, useEffect } from 'react';
import { amharicMap, reverseMap } from '../utils/translit';

interface UseAmharicInputOptions {
  enabled: boolean;
  onChangeText?: (amharicText: string, latinText: string) => void;
}

interface UseAmharicInputResult {
  displayValue: string;
  latinValue: string;
  handleChange: (text: string) => void;
  reset: () => void;
  setValue: (latin: string) => void;
}

const VOWELS = ['a', 'e', 'i', 'o', 'u'];
const MULTI = ['hh','sh','ch','gn','ny','zh','dz','dh','ts','tz','th','ph','sz','kx'];

export function useAmharicInput({
  enabled,
  onChangeText,
}: UseAmharicInputOptions): UseAmharicInputResult {

  // latinRef: pure Latin buffer — what the user actually typed
  // Never exposed to TextInput directly
  const latinRef = useRef('');

  // prevDisplayRef: last Amharic string shown in the TextInput
  const prevDisplayRef = useRef('');

  const [displayValue, setDisplayValue] = useState('');

  // When enabled toggles, re-render display from Latin buffer
  useEffect(() => {
    if (!enabled) {
      setDisplayValue(latinRef.current);
      prevDisplayRef.current = latinRef.current;
      onChangeText?.(latinRef.current, latinRef.current);
    } else {
      // Re-transliterate the Latin buffer with the new enabled state
      const amharic = processFullLatin(latinRef.current);
      setDisplayValue(amharic);
      prevDisplayRef.current = amharic;
      onChangeText?.(amharic, latinRef.current);
    }
  }, [enabled]);

  // Process a single new keystroke against the current Amharic display
  // This is the Ethio-Intl approach: reverse lookup on last char
  const processKeystroke = useCallback((
    currentDisplay: string,
    currentLatin: string,
    newChar: string
  ): string => {
    const charLow = newChar.toLowerCase();

    // punctuation
    if (newChar === ' ' || newChar === '\n') return currentDisplay + newChar;
    if (newChar === ',') return currentDisplay + '፣';
    if (newChar === ';') return currentDisplay + '፤';
    if (newChar === '?') return currentDisplay + '፧';
    if (newChar === "'") return currentDisplay + 'እ';

    // Check for multi-char consonant completion
    // e.g. user already typed 's', now types 'h' → replace ስ with ሸ (base)
    if (!VOWELS.includes(charLow)) {
      const prevLatin = currentLatin;
      const lastLatinChar = prevLatin[prevLatin.length - 1]?.toLowerCase();
      if (lastLatinChar) {
        const combo = lastLatinChar + charLow;
        if (MULTI.includes(combo) && amharicMap[combo]) {
          // Replace last Amharic char with the multi-char consonant base
          return currentDisplay.slice(0, -1) + amharicMap[combo]['base'];
        }
      }
    }

    // Vowel: try to combine with last displayed Amharic character
    if (VOWELS.includes(charLow) && currentDisplay.length > 0) {
      const lastDisplayChar = currentDisplay[currentDisplay.length - 1];
      const consonantKey = reverseMap[lastDisplayChar];

      if (consonantKey && amharicMap[consonantKey]) {
        const family = amharicMap[consonantKey];

        if (charLow === 'e') {
          // Check if previous Latin keystroke was also 'e' (double ee)
          const prevLatinChar = currentLatin[currentLatin.length - 1]?.toLowerCase();
          if (prevLatinChar === 'e' && family['e']) {
            // double ee → explicit e form (ሴ)
            return currentDisplay.slice(0, -1) + family['e'];
          } else if (family['ä']) {
            // single e → ä form (ሰ)
            return currentDisplay.slice(0, -1) + family['ä'];
          }
        } else if (family[charLow]) {
          // a, u, i, o — combine with consonant
          return currentDisplay.slice(0, -1) + family[charLow];
        }
      }
    }

    // Consonant or standalone vowel — append base form
    if (amharicMap[charLow]) {
      return currentDisplay + amharicMap[charLow]['base'];
    }

    // Fallthrough: numbers, unknown chars
    return currentDisplay + newChar;
  }, []);

  // Full transliteration for setValue (processes whole Latin string at once)
  const processFullLatin = useCallback((latin: string): string => {
    // Import the full transliteration function
    const { transliterateAmharic } = require('../utils/translit');
    return transliterateAmharic(latin);
  }, []);

  const handleChange = useCallback((inputText: string) => {
    if (!enabled) {
      latinRef.current = inputText;
      prevDisplayRef.current = inputText;
      setDisplayValue(inputText);
      onChangeText?.(inputText, inputText);
      return;
    }

    const prevDisplay = prevDisplayRef.current;
    const prevLatin = latinRef.current;

    // ── Deletion ──────────────────────────────────────────────────────────────
    if (inputText.length < prevDisplay.length) {
      const deletedCount = prevDisplay.length - inputText.length;
      const newLatin = prevLatin.slice(0, prevLatin.length - deletedCount);
      const newDisplay = prevDisplay.slice(0, prevDisplay.length - deletedCount);

      latinRef.current = newLatin;
      prevDisplayRef.current = newDisplay;
      setDisplayValue(newDisplay);
      onChangeText?.(newDisplay, newLatin);
      return;
    }

    // ── Addition ──────────────────────────────────────────────────────────────
    // inputText contains the Amharic display value + newly typed Latin chars
    // The newly added chars are at the end and are Latin
    const addedChars = inputText.slice(prevDisplay.length);

    let newDisplay = prevDisplay;
    let newLatin = prevLatin;

    for (const char of addedChars) {
      newDisplay = processKeystroke(newDisplay, newLatin, char);
      newLatin += char;
    }

    latinRef.current = newLatin;
    prevDisplayRef.current = newDisplay;
    setDisplayValue(newDisplay);
    onChangeText?.(newDisplay, newLatin);
  }, [enabled, processKeystroke, onChangeText]);

  const reset = useCallback(() => {
    latinRef.current = '';
    prevDisplayRef.current = '';
    setDisplayValue('');
    onChangeText?.('', '');
  }, [onChangeText]);

  const setValue = useCallback((latin: string) => {
    latinRef.current = latin;
    const output = enabled ? processFullLatin(latin) : latin;
    prevDisplayRef.current = output;
    setDisplayValue(output);
    onChangeText?.(output, latin);
  }, [enabled, processFullLatin, onChangeText]);

  return {
    displayValue,
    latinValue: latinRef.current,
    handleChange,
    reset,
    setValue,
  };
}