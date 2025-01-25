import React  from 'react'
import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

import { theme } from '@core/theme';

export default function Header(props, style) {
  return <Text style={[styles.header, style]} {...props} />
}

const styles = StyleSheet.create({
  header: {
    fontSize: 32,
    color: theme.colors.primary,
    fontWeight: 'bold',
    paddingVertical: 12,
  },
})
