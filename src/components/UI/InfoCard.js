import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing, shadow, tones, toneCycle } from '@core/theme';

// Card listing label/value rows. rows: [{ label, value, icon, tone }]
// Each row icon sits in a coloured tile; rows without a `tone` cycle through toneCycle.
export default function InfoCard({ title, titleIcon = 'reader', tone = 'indigo', rows, style }) {
  const visibleRows = rows.filter(row => row.value !== undefined && row.value !== null && row.value !== '');
  const headerTone = tones[tone] ?? tones.indigo
  return (
    <View style={[styles.card, style]}>
      {title && (
        <View style={[styles.header, { backgroundColor: headerTone.bg }]}>
          <Ionicons name={titleIcon} size={16} color={headerTone.fg} />
          <Text style={[styles.title, { color: headerTone.fg }]}>{title}</Text>
        </View>
      )}
      <View style={styles.rows}>
        {visibleRows.map((row, index) => {
          const rowTone = tones[row.tone ?? toneCycle[index % toneCycle.length]]
          return (
            <View key={row.label} style={[styles.row, index < visibleRows.length - 1 && styles.rowDivider]}>
              {row.icon && (
                <View style={[styles.iconTile, { backgroundColor: rowTone.bg }]}>
                  <Ionicons name={row.icon} size={18} color={rowTone.fg} />
                </View>
              )}
              <View style={styles.rowText}>
                <Text style={styles.label}>{row.label}</Text>
                <Text style={styles.value}>{String(row.value)}</Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.soft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  rows: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: palette.subText,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
  },
});
