import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { TextInput as Input } from 'react-native-paper'

import { theme, palette, radius } from '@core/theme';

export default function TextInput({ errorText, description, style,inputStyle, ...props }) {
  return (
    <View style={[styles.container, style]}>
      <Input
        style={[styles.input, inputStyle]}
        selectionColor={theme.colors.primary}
        underlineColor="transparent"
        textColor={theme.colors.text}
        {...props}
      />
      {description && !errorText ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 12,
  },
  input: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    borderBottomWidth: 2,
    borderBottomColor: palette.primary,
  },
  description: {
    fontSize: 13,
    color: theme.colors.secondary,
    paddingTop: 8,
  },
  error: {
    fontSize: 13,
    color: theme.colors.error,
    paddingTop: 8,
  },
})
