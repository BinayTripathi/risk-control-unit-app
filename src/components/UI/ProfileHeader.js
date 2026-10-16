import { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

import { palette, radius, spacing, shadow, typography } from '@core/theme';

const initialsOf = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('')

// Person summary banner: photo (base64) or initials, name and a subtitle line.
export default function ProfileHeader({ overline, name, subtitle, photoBase64, color = palette.primary }) {
  const [imageFailed, setImageFailed] = useState(false)
  const hasPhoto = !!photoBase64 && photoBase64 !== 'null' && !imageFailed

  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <View style={styles.decorLarge} />
      <View style={styles.decorSmall} />
      <View style={styles.avatarRing}>
        {hasPhoto
          ? <Image style={styles.avatar} source={{ uri: `data:image/*;base64,${photoBase64}` }} onError={() => setImageFailed(true)} />
          : <View style={[styles.avatar, styles.initials]}><Text style={[styles.initialsText, { color }]}>{initialsOf(name)}</Text></View>}
      </View>
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
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadow.soft,
  },
  decorLarge: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    right: -50,
    top: -60,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  decorSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    right: 60,
    bottom: -50,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  avatarRing: {
    padding: 3,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: '#FDBA74',
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
    backgroundColor: palette.surface,
  },
  initialsText: {
    fontSize: 24,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  overline: {
    ...typography.label,
    color: '#FDBA74',
    marginBottom: 2,
  },
  name: {
    ...typography.title,
    fontSize: 20,
    color: palette.onPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});
