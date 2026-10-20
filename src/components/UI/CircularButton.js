import { StyleSheet, View, Text, Pressable} from 'react-native';
import { palette, radius, spacing, shadow, tones } from '@core/theme';

// Quick-action tile (icon + label). `title` is injected by CustomDateTimePicker once a date is chosen.
export default CircularButton = ({label, title, children, onPress, tone = 'orange', disabled = false}) => {
    const t = tones[tone] ?? tones.orange

    return (
        <Pressable onPress={onPress} disabled={disabled} accessibilityState={{ disabled }}
            style={({ pressed }) => [styles.tile, { borderBottomColor: t.fg }, pressed && styles.pressed, disabled && styles.disabled]}>
            <View style={[styles.icon, { backgroundColor: t.bg }]}>
                {children}
            </View>
            <Text style={styles.label} numberOfLines={2}>{label}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    tile: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: palette.surface,
        borderRadius: radius.lg,
        borderBottomWidth: 3,
        padding: spacing.md,
        ...shadow.soft,
    },
    pressed: {
        opacity: 0.7,
    },
    disabled: {
        opacity: 0.45,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    label: {
        flex: 1,
        color: palette.text,
        fontSize: 14,
        fontWeight: '600',
    },
})
