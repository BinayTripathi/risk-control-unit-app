import React from 'react'
import { StyleSheet } from 'react-native'
import { Button as PaperButton } from 'react-native-paper'

import { palette, radius } from '@core/theme';

// variant: 'primary' (filled navy), 'secondary' (outlined), 'danger', 'warning'
export default function Button({ mode, style, labelStyle, variant = 'primary', disabled, children, ...props }) {
  const variantStyle = styles[variant] ?? styles.primary
  const variantLabel = variant === 'secondary' ? styles.labelSecondary : styles.labelPrimary
  return (
    <PaperButton
      style={[
        styles.button,
        variantStyle,
        disabled && styles.disabled,
        style,
      ]}
      contentStyle={styles.content}
      labelStyle={[styles.text, variantLabel, labelStyle]}
      mode={mode}
      disabled={disabled}
      {...props}
    >
      {children}
      </PaperButton>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    marginVertical: 8,
    borderRadius: radius.md,
  },
  content: {
    height: 48,
  },
  primary: {
    backgroundColor: palette.primary,
  },
  secondary: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  danger: {
    backgroundColor: palette.danger,
  },
  warning: {
    backgroundColor: palette.warning,
  },
  disabled: {
    backgroundColor: palette.muted,
    borderWidth: 0,
  },
  text: {
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  labelPrimary: {
    color: palette.onPrimary,
  },
  labelSecondary: {
    color: palette.text,
  },
})
