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

export default function Logout() {

    const dispatch = useDispatch()
    const navigation = useNavigation()    

    return (
       <Pressable 
         style={styles.logoutRow} 
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
         <Text style={styles.logoutText}>Logout</Text>
       </Pressable>
    )
}

const styles = StyleSheet.create({
  logoutRow: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});


