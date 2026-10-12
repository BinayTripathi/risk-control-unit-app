// components/Drawer.js
import React from 'react';
import { View, Text, Pressable, Animated, StyleSheet, Image, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import Logout from '@components/AuthComponent/LogoutComponent';
import { secureGet } from '@helpers/SecureStore';
import { SECURE_USER_KEY } from '@core/constants';
import { palette, spacing, shadow } from '@core/theme';

const DRAWER_WIDTH = 280;

export default function Drawer({ visible, onClose }) {
  const translateX = React.useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const [userEmail, setUserEmail] = React.useState(null);
  const [profileImageFailed, setProfileImageFailed] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      secureGet(SECURE_USER_KEY).then(setUserEmail).catch(() => {});
      setProfileImageFailed(false);
    }
  }, [visible]);

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10; // Only respond to horizontal moves
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx > 0) { // Only allow dragging to the right
          translateX.setValue(DRAWER_WIDTH - gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > DRAWER_WIDTH / 2) { // If dragged more than half, close
          onClose();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  );

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropPressable} onPress={onClose} />
      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX }] },
          visible ? panResponder.current.panHandlers : {}
        ]}
      >
        <View style={styles.panel}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8} accessibilityLabel="Close menu">
              <Ionicons name="close" size={24} color={palette.onPrimary} />
            </Pressable>
            {profileImageFailed
              ? <View style={[styles.profileImage, styles.profilePlaceholder]}>
                  <Ionicons name="person" size={36} color={palette.primary} />
                </View>
              : <Image
                  source={{ uri: FileSystem.documentDirectory + 'profile.jpg' }}
                  style={styles.profileImage}
                  onError={() => setProfileImageFailed(true)}
                />}
            <Text style={styles.roleText}>Field Agent</Text>
            {userEmail && <Text style={styles.nameText} numberOfLines={1}>{userEmail}</Text>}
          </View>
          <View style={styles.body}>
            <Logout />
          </View>
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    ...shadow.raised,
  },
  panel: {
    flex: 1,
    backgroundColor: palette.surface,
  },
  header: {
    backgroundColor: palette.primary,
    paddingTop: 48,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  closeButton: {
    position: 'absolute',
    top: 44,
    right: spacing.lg,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: palette.onPrimary,
  },
  profilePlaceholder: {
    backgroundColor: palette.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.onPrimary,
    marginTop: 2,
  },
  body: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  versionContainer: {
    padding: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
  },
  versionText: {
    fontSize: 12,
    color: palette.muted,
  },
});