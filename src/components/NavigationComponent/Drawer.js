// components/Drawer.js
import React from 'react';
import { View, Text, Pressable, Animated, StyleSheet, Image, PanResponder } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';import * as FileSystem from 'expo-file-system';import Logout from '@components/AuthComponent/LogoutComponent';

const DRAWER_WIDTH = 250;

export default function Drawer({ visible, onClose }) {
  const translateX = React.useRef(new Animated.Value(DRAWER_WIDTH)).current;

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
        <LinearGradient
          colors={['#FFB366', '#FF9933']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <AntDesign name="close" size={24} color="white" />
            </Pressable>
          </View>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: FileSystem.documentDirectory + 'profile.jpg' }}
              style={styles.profileImage}
            />
            <View style={styles.row}>
              <Text style={styles.nameText}>John Doe</Text>
            </View>
            <Logout />
          </View>
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </LinearGradient>
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  gradient: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  closeButton: {
    padding: 5,
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  row: {
    marginBottom: 20,
  },
  nameText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
  },
});