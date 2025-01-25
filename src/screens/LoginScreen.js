import React, { useState, useEffect } from 'react'
import {StyleSheet, Text, View} from "react-native"
import { useDispatch, useSelector } from 'react-redux'
import { useIsFocused } from '@react-navigation/native'

import {requestValidateUser, requestValidateUserAuto, navigateFromHomePage} from './../store/ducks/userSlice'
import Background from '@components/UI/Background'
import Logo from '@components/UI/Logo'
import Button from '@components/UI/Button'

import { Entypo } from '@expo/vector-icons';

import { theme } from '../core/theme'
import { SCREENS, SESSION_TTL_IN_SEC } from '../core/constants'
import LoadingModalWrapper from '@components/UI/LoadingModal';
import Constanst from 'expo-constants'
import LocalAuthComponent from './../components/AuthComponent/LocalAuthComponent'
import {SECURE_USER_KEY, SECURE_USER_PIN, SECURE_REGISTRATION_COMPLETE} from '../core/constants'
import {secureGet, secureRemove} from '@helpers/SecureStore'

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

const CELL_COUNT = 4
export default function LoginScreen({navigation}) {

  const BASE_URL = Constanst?.expoConfig?.extra?.baseURL
  let isLoading = useSelector((state) => state.user.loading);
  let userLoggingError = useSelector((state) => state.user.error);
  let userLoggingTimestamp = useSelector((state) => state.user.lastLogin);
  let dispatch = useDispatch();
  const isFocused = useIsFocused()


  const [biometicCancelled, setBiometicCancelled] = useState(false)
  const [email, setEmail] = useState()
  const [pin, setPin] = useState('')
  const ref = useBlurOnFulfill({pin, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    pin,
    setPin,
  })
  const [savedPin, setSavedPin] = useState('')
  const [pinMatchFailed, setPinMatchFailed] = useState(false)
  // if loging within 30 sec of loggout, dispatch autologin

  useEffect(() => { 

    (async() => {
        try{
          const user = await secureGet(SECURE_USER_KEY)
          const receivedPin = await secureGet(SECURE_USER_PIN)
          console.log(`Within login ${user}`)
          setEmail(user)
          setSavedPin(receivedPin)
        } catch (error) {
          console.log(error)
        }      
      }
    )()    
  },[])

  useEffect(() => { 
    dispatch(navigateFromHomePage())
    console.log(Math.floor(new Date() - new Date(userLoggingTimestamp)))
    if(Math.floor(new Date() - new Date(userLoggingTimestamp)) < SESSION_TTL_IN_SEC.USER_SESSION) {
      const dataforLogin = {
        emailId: email
      }
      dispatch(requestValidateUserAuto(dataforLogin))
      navigation.reset({routes: [{name: 'CaseList'}]});   
    }
    
  }, [dispatch, isFocused, navigation])



  const onLoginPressed = async (e) => {
    
    const headerOptions = new Headers()
    headerOptions.append(
      'Content-Type',
      'application/x-www-form-urlencoded;charset=UTF-8'
    )
    headerOptions.append(
      'Access-Control-Allow-Origin',
      'http://localhost:19006'
    )
    headerOptions.append('Access-Control-Allow-Credentials', 'true')
    headerOptions.append('GET', 'POST', 'OPTIONS')

    console.log(email)
    const dataToSendForAuth = {
      emailId: email,
      password: pin,
      returnUrl: 'http://localhost:19006/',
    }

    const receivedPin = await secureGet(SECURE_USER_PIN)
   
    if(receivedPin !== pin) {
      setPinMatchFailed(true)
    } else {
      dispatch(requestValidateUser(dataToSendForAuth))
    }
          
  }

   const loggingError = userLoggingError || pinMatchFailed ? 
   <Text style={styles.errorTextStyle}>Invalid user id or PIN</Text> 
   :null
  return (
    <LoadingModalWrapper shouldModalBeVisible = {isLoading}>
      <Background>
        
        <View style = {styles.wrapper}>
          {!biometicCancelled && <LocalAuthComponent navigation = {navigation} setBiometicCancelled = {setBiometicCancelled}/> }
          <Logo />         
          <Text style={{fontWeight: '900'}}>PLEASE LOGIN {email}</Text> 
          <Text style={{fontWeight: '900'}}></Text> 
          <Text style={{fontWeight: '800'}}>DEMO VERSION</Text>                   
          <Text>URL: {BASE_URL}</Text>

          <CodeField
            ref={ref}        
            value={pin}
            onChangeText={setPin}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({index, symbol, isFocused}) => (
              <Text
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}>
                {symbol || (isFocused ? <Cursor/> : null)}
              </Text>
            )}/>
          
          <View>{loggingError}</View>
          <Button mode="contained" disabled= {pin.toString().length < CELL_COUNT}
            onPress={onLoginPressed}
            onLongPress={() => {
              dispatch({ type: "DESTROY_SESSION" });
              secureRemove(SECURE_USER_KEY)
              secureRemove(SECURE_USER_PIN)
              secureRemove(SECURE_REGISTRATION_COMPLETE)
              navigation.navigate(SCREENS.RegistrationScreen)              
              /*onLoginPressed()*/ }}
              style={[styles.button, pin.toString().length < CELL_COUNT ? styles.buttonDisabled : '']}>
          <Entypo name="key" size={18} color="white" /> LOGIN
          </Button>

        </View>    
      
      </Background>
    </LoadingModalWrapper>
  )
};

const styles = StyleSheet.create({

  wrapper : {
    flex:1,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  button: {
    marginTop: 50
  },
  buttonDisabled : {
    backgroundColor: theme.colors.disabledPrimary,
    opacity: 0.5
  },

  errorTextStyle: {
    color: theme.colors.error,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold'
  },

  codeFieldRoot: {marginTop: 20},
    cell: {
      width: 40,
      height: 40,
      lineHeight: 38,
      marginRight: 2,
      fontSize: 24,
      borderWidth: 2,
      borderRadius: 8,
      borderColor: '#00000030',
      textAlign: 'center',
    },
    focusCell: {
      borderColor: '#000',
    },

})
