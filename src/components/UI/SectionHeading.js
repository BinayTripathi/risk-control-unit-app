import { View, Text, StyleSheet } from 'react-native';

import { palette, spacing, typography } from '@core/theme';

// Page heading used at the top of each case-details page.
export default function SectionHeading({ overline, title, required, subtitle, style }) {
  return (
    <View style={[styles.container, style]}>
      {overline && <Text style={styles.overline}>{overline}</Text>}
      <Text style={styles.title}>
        {title}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  overline: {
    ...typography.label,
    color: palette.primary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
  },
  required: {
    color: palette.danger,
  },
  subtitle: {
    fontSize: 14,
    color: palette.subText,
    marginTop: spacing.xs,
  },
});
