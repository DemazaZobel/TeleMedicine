import React, { useMemo, useCallback } from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import {
  createButtonStyles,
  ButtonVariant,
  ButtonSize,
} from './Button.styles';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = React.memo(function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  icon,
  style,
  textStyle,
  ...rest
}: ButtonProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createButtonStyles(theme), [theme]);

  const variantContainerMap = useMemo(
    (): Record<ButtonVariant, ViewStyle> => ({
      primary: styles.primary,
      secondary: styles.secondary,
      outline: styles.outline,
      ghost: styles.ghost,
    }),
    [styles]
  );

  const variantPressedMap = useMemo(
    (): Record<ButtonVariant, ViewStyle> => ({
      primary: styles.primaryPressed,
      secondary: styles.secondaryPressed,
      outline: styles.outlinePressed,
      ghost: styles.ghostPressed,
    }),
    [styles]
  );

  const getTextStyle = useCallback((): TextStyle[] => {
    const variantTextMap: Record<ButtonVariant, TextStyle> = {
      primary: styles.textPrimary,
      secondary: styles.textSecondary,
      outline: styles.textOutline,
      ghost: styles.textGhost,
    };
    const sizeTextMap: Record<ButtonSize, TextStyle> = {
      sm: styles.textSm,
      md: styles.textMd,
      lg: styles.textLg,
    };
    return [
      variantTextMap[variant],
      sizeTextMap[size],
      ...(disabled ? [styles.disabledText] : []),
      ...(textStyle ? [textStyle] : []),
    ];
  }, [variant, size, disabled, textStyle, styles]);

  return (
    <Pressable
      disabled={disabled || loading}
      {...rest}
      style={({ pressed }): ViewStyle[] => [
        styles.base,
        styles[size],
        variantContainerMap[variant],
        ...(pressed ? [variantPressedMap[variant]] : []),
        ...(disabled ? [styles.disabled] : []),
        ...(fullWidth ? [styles.fullWidth] : []),
        ...(style ? [style] : []),
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? theme.colors.primary
              : theme.colors.textInverse
          }
        />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </Pressable>
  );
});

