import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';

import {logoutUser} from '@store/ducks/userSlice'
import { SCREENS } from '@core/constants';

import {secureRemove} from '@helpers/SecureStore'
import {SECURE_USER_KEY} from '@core/constants'
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing } from '@core/theme';

export default function Logout() {

    const dispatch = useDispatch()
    const navigation = useNavigation()    

    return (
       <Pressable 
         style={({ pressed }) => [styles.logoutRow, pressed && styles.pressed]}
         onPress={() => {
           dispatch(logoutUser())
           navigation.reset({
             index: 0,
             routes: [{ name: SCREENS.Login , params: { lastState: 'Logout' }}],
           })
         }}
         onLongPress={async () => {
           secureRemove(SECURE_USER_KEY)
           dispatch({ type: "DESTROY_SESSION" });
           // Delete profile image
           try {
             const filePath = FileSystem.documentDirectory + 'profile.jpg';
             await FileSystem.deleteAsync(filePath, { idempotent: true });
             console.log('Profile image deleted');
           } catch (error) {
             console.error('Error deleting profile image:', error);
           }
           navigation.reset({
             index: 0,
             routes: [{ name: SCREENS.RegistrationScreen , params: { lastState: 'Logout' }}],
           })
         }}
       >
         <Ionicons name="log-out-outline" size={22} color={palette.danger} />
         <Text style={styles.logoutText}>Log out</Text>
       </Pressable>
    )
}

const styles = StyleSheet.create({
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  pressed: {
    backgroundColor: palette.dangerTint,
  },
  logoutText: {
    marginLeft: spacing.md,
    fontSize: 16,
    color: palette.danger,
    fontWeight: '600',
  },
});
