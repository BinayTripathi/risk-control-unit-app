import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { palette } from '@core/theme';

export default function HeaderHamburger({ onPress }) {

  return (
    <Pressable onPress={onPress} style={styles.button} hitSlop={8} accessibilityLabel="Open menu">
      <Ionicons name="menu" size={26} color={palette.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});
