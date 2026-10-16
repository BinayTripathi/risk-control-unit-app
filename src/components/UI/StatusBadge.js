import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { palette, radius } from '@core/theme';

const STATUS = {
  success: { fg: palette.success, bg: palette.successTint, icon: 'checkmark-circle' },
  failure: { fg: palette.danger, bg: palette.dangerTint, icon: 'alert-circle' },
  loading: { fg: palette.warning, bg: palette.warningTint, icon: 'cloud-upload-outline' },
  pending: { fg: palette.subText, bg: palette.divider, icon: 'ellipse-outline' },
  info: { fg: palette.primary, bg: palette.primaryTint, icon: null },
};

export default function StatusBadge({ status = 'pending', label, style }) {
  const s = STATUS[status] ?? STATUS.pending;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }, style]}>
      {s.icon && <Ionicons name={s.icon} size={13} color={s.fg} style={styles.icon} />}
      <Text style={[styles.text, { color: s.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
