import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing, shadow, tones } from '@core/theme';
import StatusBadge from './StatusBadge';

const CollapsibleSection = ({ title, icon, tone = 'indigo', sectionComplete, children }) => {
  const [collapsed, setCollapsed] = useState(true);
  const t = tones[tone] ?? tones.indigo

  return (
    <View style={[styles.section, { borderLeftColor: sectionComplete ? tones.green.fg : t.fg }]}>
      <TouchableOpacity onPress={() => setCollapsed(!collapsed)}
        style={[styles.header, !collapsed && { backgroundColor: t.bg }]} activeOpacity={0.7}>
        {icon && (
          <View style={[styles.iconWrap, { backgroundColor: collapsed ? t.bg : t.fg }]}>
            <Ionicons name={icon} size={20} color={collapsed ? t.fg : palette.onPrimary} />
          </View>
        )}
        <Text style={styles.headerText}>{title}</Text>
        <StatusBadge status={sectionComplete ? 'success' : 'pending'} label={sectionComplete ? 'Done' : 'Pending'} />
        <Ionicons name={collapsed ? 'chevron-down' : 'chevron-up'} size={20} color={t.fg} style={styles.chevron} />
      </TouchableOpacity>
      <Collapsible collapsed={collapsed}>
        <View style={styles.content}>{children}</View>
      </Collapsible>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 5,
    width: '100%',
    overflow: 'hidden',
    ...shadow.soft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: palette.text,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});

export default CollapsibleSection;
