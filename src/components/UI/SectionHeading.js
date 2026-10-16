import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing, shadow, typography } from '@core/theme';

// Coloured banner used at the top of each case-details page.
export default function SectionHeading({ overline, title, required, subtitle, icon, color = palette.primary, style }) {
  return (
    <View style={[styles.banner, { backgroundColor: color }, style]}>
      <View style={styles.decorLarge} />
      <View style={styles.decorSmall} />
      <View style={styles.row}>
        <View style={styles.text}>
          {overline && <Text style={styles.overline}>{overline}</Text>}
          <Text style={styles.title}>
            {title}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {icon && (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={26} color={palette.onPrimary} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadow.soft,
  },
  // Translucent circles for a bit of depth on the flat colour
  decorLarge: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    right: -40,
    top: -50,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  decorSmall: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    right: 50,
    bottom: -45,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
  },
  overline: {
    ...typography.label,
    color: '#FDBA74',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
    color: palette.onPrimary,
  },
  required: {
    color: '#FDBA74',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
});
