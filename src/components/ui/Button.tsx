import React, { useCallback, useMemo } from 'react';
import {
    ActivityIndicator,
    Pressable,
    PressableProps,
    StyleProp,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import {
    ButtonSize,
    ButtonVariant,
    createButtonStyles,
} from './Button.styles';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
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
      danger: styles.danger,
    }),
    [styles]
  );

  const variantPressedMap = useMemo(
    (): Record<ButtonVariant, ViewStyle> => ({
      primary: styles.primaryPressed,
      secondary: styles.secondaryPressed,
      outline: styles.outlinePressed,
      ghost: styles.ghostPressed,
      danger: styles.dangerPressed,
    }),
    [styles]
  );

  const getTextStyle = useCallback(() => {
    const variantTextMap: Record<ButtonVariant, TextStyle> = {
      primary: styles.textPrimary,
      secondary: styles.textSecondary,
      outline: styles.textOutline,
      ghost: styles.textGhost,
      danger: styles.textDanger,
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
    ] as StyleProp<TextStyle>;
  }, [variant, size, disabled, textStyle, styles]);

  return (
    <Pressable
      disabled={disabled || loading}
      {...rest}
      style={({ pressed }) => [
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
          {icon && <React.Fragment>{icon}</React.Fragment>}
          {icon && <View style={{ width: theme.spacing.sm }} />}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </Pressable>
  );
});

