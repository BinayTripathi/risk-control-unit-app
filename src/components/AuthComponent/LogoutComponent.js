import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';

import {logoutUser} from '@store/ducks/userSlice'
import { SCREENS } from '@core/constants';

import {secureRemove} from '@helpers/SecureStore'
import {SECURE_USER_KEY} from '@core/constants'
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

export default function Logout() {

    const dispatch = useDispatch()
    const navigation = useNavigation()    

    return (
       <>
        <AntDesign name="logout" size={30} color="black" onPress={() => {
                dispatch(logoutUser())
                navigation.reset({
                    index: 0,
                    routes: [{ name: SCREENS.Login , params: { lastState: 'Logout' }}],
            })
            }}

            onLongPress={() => {
                secureRemove(SECURE_USER_KEY)
                dispatch({ type: "DESTROY_SESSION" });
                navigation.reset({
                    index: 0,
                    routes: [{ name: SCREENS.RegistrationScreen , params: { lastState: 'Logout' }}],
            })
            }}

           />
           </>
     
    )
}


