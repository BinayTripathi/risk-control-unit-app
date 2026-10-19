import {View, Text, StyleSheet, Pressable} from 'react-native'
import { Modal, Portal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing, shadow } from '@core/theme';


const OkayCancelDialogBox = ({showDialog, setShowDialog, title, content, okayHandler, cancelHandler, okLabel = 'OK', cancelLabel = 'Cancel', icon = 'help-circle'}) => {

    const dismissHandler = () => {
        setShowDialog(false)
        cancelHandler?.()
    }

    const approveHandler = () => {
        setShowDialog(false)
        okayHandler?.()
    }

    return (
        <Portal>
            <Modal visible={showDialog} onDismiss={dismissHandler} contentContainerStyle={styles.containerStyle} dismissable={true}>
                <View style={styles.card}>
                    <View style={styles.iconTile}>
                        <Ionicons name={icon} size={30} color={palette.primary} />
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    {!!content && <Text style={styles.content}>{content}</Text>}

                    <View style={styles.actions}>
                        <Pressable
                            onPress={dismissHandler}
                            style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed]}
                        >
                            <Text style={[styles.buttonLabel, styles.cancelLabel]}>{cancelLabel}</Text>
                        </Pressable>
                        <Pressable
                            onPress={approveHandler}
                            style={({ pressed }) => [styles.button, styles.okButton, pressed && styles.pressed]}
                        >
                            <Text style={[styles.buttonLabel, styles.okLabel]}>{okLabel}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </Portal>
    )
}

export default OkayCancelDialogBox

const styles = StyleSheet.create({
    containerStyle: {
        backgroundColor: 'transparent',
        marginHorizontal: spacing.xl,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: palette.surface,
        borderRadius: radius.lg + 6,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
        alignItems: 'center',
        ...shadow.raised,
    },
    iconTile: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: palette.primaryTint,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 19,
        fontWeight: '700',
        color: palette.text,
        textAlign: 'center',
    },
    content: {
        marginTop: spacing.sm,
        fontSize: 15,
        lineHeight: 21,
        color: palette.subText,
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        gap: spacing.md,
        marginTop: spacing.xl,
    },
    button: {
        flex: 1,
        height: 46,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
    },
    okButton: {
        backgroundColor: palette.primary,
    },
    pressed: {
        opacity: 0.8,
    },
    buttonLabel: {
        fontSize: 15,
        fontWeight: '700',
    },
    cancelLabel: {
        color: palette.subText,
    },
    okLabel: {
        color: palette.onPrimary,
    },
});
