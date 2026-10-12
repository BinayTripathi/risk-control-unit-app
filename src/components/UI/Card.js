import { View, StyleSheet } from "react-native";

import { palette, radius, spacing, shadow } from "@core/theme";

export default function Card({children, style}) {

    return (<View style={[styles.card, style]}>{children}</View>)
}

const styles = StyleSheet.create({
    card: {
      backgroundColor: palette.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.border,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadow.card,
    }
  });
