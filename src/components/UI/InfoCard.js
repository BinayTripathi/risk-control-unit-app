import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing, shadow, typography } from '@core/theme';

// Card listing label/value rows. rows: [{ label, value, icon }]
export default function InfoCard({ title, rows, style }) {
  const visibleRows = rows.filter(row => row.value !== undefined && row.value !== null && row.value !== '');
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {visibleRows.map((row, index) => (
        <View key={row.label} style={[styles.row, index < visibleRows.length - 1 && styles.rowDivider]}>
          {row.icon && <Ionicons name={row.icon} size={18} color={palette.muted} style={styles.icon} />}
          <View style={styles.rowText}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>{String(row.value)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadow.card,
  },
  title: {
    ...typography.label,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  icon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  rowText: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: palette.subText,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text,
  },
});
