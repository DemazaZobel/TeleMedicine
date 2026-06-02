// src/hooks/useAmharicInput.ts
// The key insight: TextInput's onChangeText gives us the DISPLAYED value
// (which is Amharic). We must track Latin separately using a ref.

import { useState, useRef, useCallback, useEffect } from 'react';
import { transliterateAmharic } from '../utils/translit';

interface UseAmharicInputOptions {
  enabled: boolean;
  initialValue?: string;
  onChangeText?: (amharicText: string, latinText: string) => void;
}

interface UseAmharicInputResult {
  displayValue: string;
  latinValue: string;
  handleChange: (text: string) => void;
  reset: () => void;
  setValue: (latin: string) => void;
}

export function useAmharicInput({
  enabled,
  initialValue = '',
  onChangeText,
}: UseAmharicInputOptions): UseAmharicInputResult {

  // latinRef stores what the user ACTUALLY typed (Latin only)
  // We use a ref (not state) so it never triggers re-renders by itself
  const latinRef = useRef(initialValue);

  // displayValue is what the TextInput shows (Amharic when enabled)
  const [displayValue, setDisplayValue] = useState(
    enabled ? transliterateAmharic(initialValue) : initialValue
  );

  // Keep display synced when enabled toggle changes
  useEffect(() => {
    const output = enabled
      ? transliterateAmharic(latinRef.current)
      : latinRef.current;
    setDisplayValue(output);
  }, [enabled]);

  const handleChange = useCallback(
    (inputText: string) => {
      if (!enabled) {
        // Not transliterating — just pass through
        latinRef.current = inputText;
        setDisplayValue(inputText);
        onChangeText?.(inputText, inputText);
        return;
      }

      // CRITICAL: inputText here is the current TextInput value.
      // When enabled, the TextInput shows Amharic (e.g. "ሰላ").
      // We cannot use inputText directly — we must figure out
      // what Latin characters changed.

      const prevAmharic = displayValue;
      const prevLatin = latinRef.current;

      if (inputText.length < prevAmharic.length) {
        // User deleted — remove same number of chars from Latin
        const deletedCount = prevAmharic.length - inputText.length;
        const newLatin = prevLatin.slice(0, prevLatin.length - deletedCount);
        latinRef.current = newLatin;
        const newAmharic = transliterateAmharic(newLatin);
        setDisplayValue(newAmharic);
        onChangeText?.(newAmharic, newLatin);
      } else {
        // User added chars — the new chars are Latin (not Amharic)
        // because the keyboard sends Latin keystrokes
        const addedAmharicLength = inputText.length - prevAmharic.length;
        const addedChars = inputText.slice(prevAmharic.length);
        // addedChars are the raw Latin characters typed
        const newLatin = prevLatin + addedChars;
        latinRef.current = newLatin;
        const newAmharic = transliterateAmharic(newLatin);
        setDisplayValue(newAmharic);
        onChangeText?.(newAmharic, newLatin);
      }
    },
    [enabled, displayValue, onChangeText]
  );

  const setValue = useCallback(
    (latin: string) => {
      latinRef.current = latin;
      const output = enabled ? transliterateAmharic(latin) : latin;
      setDisplayValue(output);
      onChangeText?.(output, latin);
    },
    [enabled, onChangeText]
  );

  const reset = useCallback(() => {
    latinRef.current = '';
    setDisplayValue('');
    onChangeText?.('', '');
  }, [onChangeText]);

  return {
    displayValue,
    latinValue: latinRef.current,
    handleChange,
    reset,
    setValue,
  };
}