import React  from 'react'
import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

import { typography, spacing } from '@core/theme';

export default function Header(props, style) {
  return <Text style={[styles.header, style]} {...props} />
}

const styles = StyleSheet.create({
  header: {
    ...typography.title,
    paddingVertical: spacing.sm,
  },
})
