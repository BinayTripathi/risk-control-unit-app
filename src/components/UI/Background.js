import React from 'react';
import { StyleSheet, View, Modal, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing, shadow, typography } from '@core/theme';
import Toast from 'react-native-root-toast';
import useNetworkInfo from '@hooks/useNetworkInfo';
import useLocationStatus from '@hooks/useLocationStatus';



// variant 'dark' is for camera/recording screens, where white controls sit over the preview
export default function Background({children, variant }) {

  let [isNetworkConnected] = useNetworkInfo()
  const { isLocationEnabled, isPermissionGranted, isChecking } = useLocationStatus(5*1000);

  return (
    <View style={[styles.rootContainer, variant === 'dark' && styles.dark]}>
     <Modal
        animationType="fade"
        transparent={true}
        visible={!isLocationEnabled}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIcon}>
              <Ionicons name="location-outline" size={28} color={palette.primary} />
            </View>
            <Text style={styles.modalTitle}>Location is turned off</Text>
            <Text style={styles.modalText}>Turn on location services to continue. Case visits are verified using your location.</Text>
          </View>
        </View>
      </Modal>

        <Toast
            visible={!isNetworkConnected}
            position={50}
            shadow={false}
            animation={true}
            duration={Toast.durations.SHORT}
            backgroundColor={palette.danger}
        >No internet connection</Toast>

        <View style={styles.container} accessible={true}>
            {children}
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: palette.background,
  },
  dark: {
    backgroundColor: palette.cameraBackground,
  },
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    padding: spacing.xl,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadow.raised,
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.heading,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.subText,
    textAlign: 'center',
  },
})
