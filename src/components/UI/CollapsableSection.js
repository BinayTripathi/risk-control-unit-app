import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing, shadow } from '@core/theme';
import StatusBadge from './StatusBadge';

const CollapsibleSection = ({ title, icon, sectionComplete, children }) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <View style={styles.section}>
      <TouchableOpacity onPress={() => setCollapsed(!collapsed)} style={styles.header} activeOpacity={0.7}>
        {icon && (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={18} color={palette.primary} />
          </View>
        )}
        <Text style={styles.headerText}>{title}</Text>
        <StatusBadge status={sectionComplete ? 'success' : 'pending'} label={sectionComplete ? 'Done' : 'Pending'} />
        <Ionicons name={collapsed ? 'chevron-down' : 'chevron-up'} size={20} color={palette.muted} style={styles.chevron} />
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    width: '100%',
    ...shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: palette.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  content: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});

export default CollapsibleSection;
