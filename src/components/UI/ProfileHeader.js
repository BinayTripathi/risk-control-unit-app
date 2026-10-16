import { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

import { palette, radius, spacing, shadow, typography } from '@core/theme';

const initialsOf = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('')

// Person summary: photo (base64) or initials, name and a subtitle line.
export default function ProfileHeader({ overline, name, subtitle, photoBase64 }) {
  const [imageFailed, setImageFailed] = useState(false)
  const hasPhoto = !!photoBase64 && photoBase64 !== 'null' && !imageFailed

  return (
    <View style={styles.card}>
      {hasPhoto
        ? <Image style={styles.avatar} source={{ uri: `data:image/*;base64,${photoBase64}` }} onError={() => setImageFailed(true)} />
        : <View style={[styles.avatar, styles.initials]}><Text style={styles.initialsText}>{initialsOf(name)}</Text></View>}
      <View style={styles.text}>
        {overline && <Text style={styles.overline}>{overline}</Text>}
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.divider,
  },
  initials: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primaryTint,
  },
  initialsText: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.primary,
  },
  text: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  overline: {
    ...typography.label,
    color: palette.primary,
    marginBottom: 2,
  },
  name: {
    ...typography.title,
    fontSize: 20,
  },
  subtitle: {
    fontSize: 14,
    color: palette.subText,
    marginTop: 2,
  },
});
