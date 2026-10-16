import { StyleSheet, View, Text, Pressable} from 'react-native';
import { palette, radius, spacing, shadow } from '@core/theme';

// Quick-action tile (icon + label). `title` is injected by CustomDateTimePicker once a date is chosen.
export default CircularButton = ({label, title, children, onPress}) => {

    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
            <View style={styles.icon}>
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
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: palette.border,
        padding: spacing.md,
        ...shadow.card,
    },
    pressed: {
        opacity: 0.7,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: palette.accentTint,
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
