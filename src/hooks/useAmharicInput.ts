// src/hooks/useAmharicInput.ts

import { useState, useCallback, useEffect } from 'react';
import { transliterateAmharic } from '../utils/translit';

interface UseAmharicInputOptions {
  enabled: boolean;
  initialValue?: string;
  onChangeText?: (
    amharicText: string,
    latinText: string
  ) => void;
}

interface UseAmharicInputResult {
  displayValue: string;
  latinValue: string;
  handleChange: (text: string) => void;
  reset: () => void;
  setValue: (text: string) => void;
}

export function useAmharicInput({
  enabled,
  initialValue = '',
  onChangeText,
}: UseAmharicInputOptions): UseAmharicInputResult {

  const [latinValue, setLatinValue] =
    useState(initialValue);

  const [displayValue, setDisplayValue] =
    useState(
      enabled
        ? transliterateAmharic(initialValue)
        : initialValue
    );

  /**
   * Keep display value synchronized
   * when language toggle changes.
   */
  useEffect(() => {
    if (enabled) {
      setDisplayValue(
        transliterateAmharic(latinValue)
      );
    } else {
      setDisplayValue(latinValue);
    }
  }, [enabled, latinValue]);

  /**
   * Main change handler
   *
   * Every change:
   * 1. Store raw Latin text
   * 2. Generate fresh Amharic text
   * 3. Notify parent
   */
  const handleChange = useCallback(
    (text: string) => {

      setLatinValue(text);

      const output = enabled
        ? transliterateAmharic(text)
        : text;

      setDisplayValue(output);

      onChangeText?.(
        output,
        text
      );
    },
    [enabled, onChangeText]
  );

  /**
   * Programmatically set value.
   */
  const setValue = useCallback(
    (text: string) => {

      setLatinValue(text);

      const output = enabled
        ? transliterateAmharic(text)
        : text;

      setDisplayValue(output);

      onChangeText?.(
        output,
        text
      );
    },
    [enabled, onChangeText]
  );

  /**
   * Reset input.
   */
  const reset = useCallback(() => {

    setLatinValue('');
    setDisplayValue('');

    onChangeText?.('', '');

  }, [onChangeText]);

  return {
    displayValue,
    latinValue,
    handleChange,
    reset,
    setValue,
  };
}