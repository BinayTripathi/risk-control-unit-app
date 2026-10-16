import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing } from '@core/theme';
import StatusBadge from './StatusBadge';

// One capture point (face photo, document, audio/video) inside an investigation section.
// status: 'idle' | 'loading' | 'success' | 'failure'
export default function CaptureItemCard({
  title, required, disabled, icon, status = 'idle',
  onCapture, onSpeak, onRetry,
  resultImageUri, resultLabel, resultPass = true,
}) {

  const statusBadge = {
    idle: <StatusBadge status="pending" label="Not captured" />,
    loading: <StatusBadge status="loading" label="Uploading" />,
    success: resultLabel
      ? <StatusBadge status={resultPass ? 'success' : 'failure'} label={`${resultLabel}: ${resultPass ? 'Pass' : 'Fail'}`} />
      : <StatusBadge status="success" label="Uploaded" />,
    failure: <StatusBadge status="failure" label="Upload failed" />,
  }[status]

  return (
    <View style={[styles.card, disabled && styles.disabled]}>
      <Pressable
        onPress={onCapture}
        disabled={disabled}
        style={({ pressed }) => [styles.captureTile, pressed && styles.captureTilePressed]}
        accessibilityRole="button"
        accessibilityLabel={`Capture ${title}`}>
        {icon}
        {status === 'loading' && (
          <View style={styles.tileOverlay}>
            <ActivityIndicator size="small" color={palette.primary} />
          </View>
        )}
      </Pressable>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {onSpeak && (
            <Pressable onPress={onSpeak} hitSlop={10} accessibilityLabel={`Read out ${title}`}>
              <Ionicons name="volume-medium-outline" size={20} color={palette.muted} />
            </Pressable>
          )}
        </View>
        {statusBadge}
        {status === 'failure' && onRetry && (
          <Pressable onPress={onRetry} style={styles.retry} hitSlop={6}>
            <Ionicons name="refresh" size={14} color={palette.primary} />
            <Text style={styles.retryText}>Retry upload</Text>
          </Pressable>
        )}
      </View>

      {status === 'success' && resultImageUri && (
        <Image
          source={{ uri: resultImageUri }}
          style={[styles.thumbnail, { borderColor: resultPass ? palette.success : palette.danger }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  disabled: {
    opacity: 0.45,
  },
  captureTile: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: palette.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  captureTilePressed: {
    opacity: 0.7,
  },
  tileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: palette.text,
    marginRight: spacing.sm,
  },
  required: {
    color: palette.danger,
  },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  retryText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '600',
    color: palette.primary,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 2,
    marginLeft: spacing.md,
  },
});
