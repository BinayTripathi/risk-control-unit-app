import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { TextInput as Input } from 'react-native-paper'

import { theme } from '@core/theme';

export default function TextInput({ errorText, description, style,inputStyle, ...props }) {
  return (
    <View style={[styles.container, style]}>
      <Input
        style={[styles.input, inputStyle]}
        selectionColor={theme.colors.primary}
        underlineColor="transparent"

        
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
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderBottomWidth: 2,
    
    borderBottomColor: theme.colors.primary
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
