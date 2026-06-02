import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useTranslation } from '../../i18n';
import { useTheme } from '../../theme';
import { getTranslitSuggestions } from '../../utils/translitSuggestions';
import { createInputStyles } from './Input.styles';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  enableTranslit?: boolean;
}

export const Input = React.memo(function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  enableTranslit = false,
  ...rest
}: InputProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const styles = useMemo(() => createInputStyles(theme), [theme]);
  
  const [isFocused, setIsFocused] = useState(false);
  const [translitEnabled, setTranslitEnabled] = useState(enableTranslit && i18n.language === 'am');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeWord, setActiveWord] = useState('');

  // Automatically update translit activation when app language changes
  useEffect(() => {
    if (enableTranslit) {
      setTranslitEnabled(i18n.language === 'am');
    }
  }, [i18n.language, enableTranslit]);

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
      // Delay suggestion clearing slightly so clicking a pill registers first
      setTimeout(() => {
        setSuggestions([]);
        setActiveWord('');
      }, 200);
      rest.onBlur?.(e);
    },
    [rest.onBlur]
  );

  const handleTextChange = useCallback((text: string) => {
    if (!translitEnabled) {
      rest.onChangeText?.(text);
      return;
    }

    // Split words but preserve separators (spaces, punctuation)
    const words = text.split(/([\s,;:?።፣፤፧]+)/);
    const lastPart = words[words.length - 1] || '';
    const isLatin = /^[a-zA-Z]+$/.test(lastPart);

    if (isLatin) {
      setActiveWord(lastPart);
      const sugs = getTranslitSuggestions(lastPart);
      setSuggestions(sugs);
      rest.onChangeText?.(text);
    } else {
      if (activeWord) {
        // Space or punctuation typed - auto-commit first transliterated suggestion
        const committedTranslit = getTranslitSuggestions(activeWord)[0] || activeWord;
        
        // Reconstruct the text replacing the typed Latin word before the typed separator
        if (words.length >= 3) {
          words[words.length - 3] = committedTranslit;
        } else if (words.length === 2) {
          words[0] = committedTranslit;
        }
        
        const newText = words.join('');
        setActiveWord('');
        setSuggestions([]);
        rest.onChangeText?.(newText);
      } else {
        rest.onChangeText?.(text);
      }
    }
  }, [translitEnabled, activeWord, rest.onChangeText]);

  const selectSuggestion = useCallback((selected: string) => {
    const currentValue = rest.value || '';
    const words = currentValue.split(/([\s,;:?።፣፤፧]+)/);
    
    // Replace the active Latin word with the selected Amharic suggestion and append space
    if (words.length >= 1) {
      words[words.length - 1] = selected + ' ';
    }
    
    const newText = words.join('');
    setActiveWord('');
    setSuggestions([]);
    rest.onChangeText?.(newText);
  }, [rest.value, rest.onChangeText]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Google Input Tools Style Suggestion Bar */}
      {translitEnabled && suggestions.length > 0 && (
        <View style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 8,
          marginBottom: 4,
          paddingVertical: 5,
          paddingHorizontal: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}
          >
            {suggestions.map((sug, idx) => (
              <Pressable 
                key={`${sug}-${idx}`}
                onPress={() => selectSuggestion(sug)}
                style={({ pressed }) => [{
                  backgroundColor: idx === 0 ? theme.colors.primary + '15' : theme.colors.inputBackground,
                  borderColor: idx === 0 ? theme.colors.primary : theme.colors.inputBorder,
                  borderWidth: 1.5,
                  borderRadius: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ 
                  fontSize: 12, 
                  fontWeight: idx === 0 ? '700' : '500', 
                  color: idx === 0 ? theme.colors.primary : theme.colors.text 
                }}>{sug}</Text>
              </Pressable>
            ))}
            <Pressable 
              onPress={() => selectSuggestion(activeWord)}
              style={({ pressed }) => [{
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1',
                borderWidth: 1,
                borderRadius: 6,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }, pressed && { opacity: 0.7 }]}
            >
              <Text style={{ fontSize: 11, fontWeight: '500', color: '#64748b' }}>
                {activeWord} (Latin)
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      )}

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
          onChangeText={handleTextChange}
          style={[
            styles.input, 
            rest.multiline && { minHeight: 48, paddingVertical: Platform.OS === 'web' ? 12 : 8 },
            inputStyle
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {/* Small premium switcher badge inside the input field */}
        {enableTranslit && (
          <Pressable 
            onPress={() => {
              setTranslitEnabled(!translitEnabled);
              setSuggestions([]);
              setActiveWord('');
            }}
            style={({ pressed }) => [{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              borderWidth: 1.5,
              borderColor: translitEnabled ? theme.colors.primary : theme.colors.border,
              backgroundColor: translitEnabled ? theme.colors.primary + '11' : theme.colors.inputBackground,
              marginRight: 4,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 3,
            }, pressed && { opacity: 0.85 }]}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: translitEnabled ? theme.colors.primary : theme.colors.textSecondary }}>ሀ</Text>
            <Text style={{ fontSize: 9, color: translitEnabled ? theme.colors.primary + '66' : theme.colors.border }}>|</Text>
            <Text style={{ fontSize: 10, fontWeight: '800', color: !translitEnabled ? theme.colors.text : theme.colors.placeholder }}>{t("common:letterA")}</Text>
          </Pressable>
        )}

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
