import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import { createInputStyles } from './Input.styles';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input = React.memo(function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  ...rest
}: InputProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createInputStyles(theme), [theme]);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
      setIsFocused(true);
      rest.onFocus?.(e);
    },
    [rest.onFocus]
  );

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      setIsFocused(false);
      rest.onBlur?.(e);
    },
    [rest.onBlur]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          placeholderTextColor={theme.colors.placeholder}
          {...rest}
          style={styles.input}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
});
