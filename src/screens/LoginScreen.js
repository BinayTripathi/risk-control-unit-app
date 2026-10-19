import React, { useState, useEffect } from 'react'
import {StyleSheet, Text, View} from "react-native"
import { useDispatch, useSelector } from 'react-redux'
import { useIsFocused } from '@react-navigation/native'

import {requestValidateUser, requestValidateUserAuto, navigateFromHomePage} from './../store/ducks/userSlice'
import Background from '@components/UI/Background'
import Logo from '@components/UI/Logo'
import Button from '@components/UI/Button'

import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing, shadow, typography } from '../core/theme'
import { SCREENS, SESSION_TTL_IN_SEC } from '../core/constants'
import LoadingModalWrapper from '@components/UI/LoadingModal';
import Constanst from 'expo-constants'
import LocalAuthComponent from './../components/AuthComponent/LocalAuthComponent'
import {SECURE_USER_KEY, SECURE_USER_PIN, SECURE_REGISTRATION_COMPLETE, SECURE_BEARER_TOKEN} from '../core/constants'
import {secureGet, secureRemove, secureSave} from '@helpers/SecureStore'
import useNetworkInfo from '@hooks/useNetworkInfo'
import {fetchJWTToken, setCachedBearerToken} from '@services/RestServiceCalls'

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
  const [isConnected] = useNetworkInfo()

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
    dispatch(navigateFromHomePage())

    ;(async() => {
        try{
          const user = await secureGet(SECURE_USER_KEY)
          const receivedPin = await secureGet(SECURE_USER_PIN)
          console.log(`Within login ${user}`)

          // Persisted redux state can outlive SecureStore (e.g. Android backup restore on reinstall).
          // Without a stored user there is nothing to log in as, so start registration again.
          if (!user || !receivedPin) {
            dispatch({ type: "DESTROY_SESSION" })
            // Defer so the navigator re-renders with the Registration screen back in the stack
            setTimeout(() => navigation.reset({index: 0, routes: [{name: SCREENS.RegistrationScreen}]}), 0)
            return
          }

          setEmail(user)
          setSavedPin(receivedPin)

          console.log(Math.floor(new Date() - new Date(userLoggingTimestamp)))
          if(Math.floor(new Date() - new Date(userLoggingTimestamp)) < SESSION_TTL_IN_SEC.USER_SESSION) {
            dispatch(requestValidateUserAuto({ emailId: user }))
            navigation.reset({routes: [{name: 'CaseList'}]});
          }
        } catch (error) {
          console.log(error)
        }
      }
    )()
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
      // Check internet and fetch JWT token during PIN login
      try {
        if (isConnected) {
          const token = await fetchJWTToken(email)
          if (token) {
            await secureSave(SECURE_BEARER_TOKEN, token)
            // populate in-memory cache as well
            setCachedBearerToken(token)
            console.log('JWT Token stored securely')
          }
        } else {
          console.log('No internet connection available')
        }
      } catch (err) {
        console.log('Error fetching token during PIN login:', err.message || err)
      }
      dispatch(requestValidateUser(dataToSendForAuth))
    }
          
  }


   const loggingError = userLoggingError || pinMatchFailed ?
   <View style={styles.errorRow}>
     <Ionicons name="alert-circle" size={16} color={palette.danger} />
     <Text style={styles.errorTextStyle}>Incorrect PIN. Please try again.</Text>
   </View>
   :null
  return (
    <LoadingModalWrapper shouldModalBeVisible = {isLoading}>
      <Background>

        <View style = {styles.wrapper}>
          {!biometicCancelled && <LocalAuthComponent navigation = {navigation} setBiometicCancelled = {setBiometicCancelled}/> }
          <Logo />

          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Enter your 4-digit PIN to continue</Text>
            {email && (
              <View style={styles.userChip}>
                <Ionicons name="person-circle-outline" size={18} color={palette.primary} />
                <Text style={styles.userChipText} numberOfLines={1}>{email}</Text>
              </View>
            )}

            <CodeField
              ref={ref}
              value={pin}
              onChangeText={(value) => { setPin(value); setPinMatchFailed(false) }}
              cellCount={CELL_COUNT}
              rootStyle={styles.codeFieldRoot}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({index, symbol, isFocused}) => (
                <View
                  key={index}
                  style={[styles.cell, isFocused && styles.focusCell, (userLoggingError || pinMatchFailed) && styles.errorCell]}
                  onLayout={getCellOnLayoutHandler(index)}>
                  <Text style={styles.cellText}>
                    {symbol ? '•' : (isFocused ? <Cursor/> : null)}
                  </Text>
                </View>
              )}/>

            {loggingError}
            <Button mode="contained" disabled= {pin.toString().length < CELL_COUNT}
              icon="lock-open-outline"
              onPress={onLoginPressed}
              onLongPress={() => {
                dispatch({ type: "DESTROY_SESSION" });
                secureRemove(SECURE_USER_KEY)
                secureRemove(SECURE_USER_PIN)
                secureRemove(SECURE_REGISTRATION_COMPLETE)
                navigation.navigate(SCREENS.RegistrationScreen)
                /*onLoginPressed()*/ }}
                style={styles.button}>
              Log in
            </Button>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Demo version</Text>
            <Text style={styles.footerText} numberOfLines={1}>{BASE_URL}</Text>
          </View>
        </View>

      </Background>
    </LoadingModalWrapper>
  )
};

const styles = StyleSheet.create({

  wrapper : {
    flex:1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadow.raised,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    fontSize: 14,
    color: palette.subText,
    marginTop: spacing.xs,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.primaryTint,
  },
  userChipText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: palette.primary,
    flexShrink: 1,
  },
  button: {
    marginTop: spacing.lg,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  errorTextStyle: {
    marginLeft: 6,
    color: palette.danger,
    fontSize: 13,
    fontWeight: '600'
  },

  codeFieldRoot: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  cell: {
    width: 52,
    height: 56,
    borderWidth: 1.5,
    borderRadius: radius.md,
    borderColor: palette.border,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 26,
    color: palette.text,
    textAlign: 'center',
  },
  focusCell: {
    borderColor: palette.primary,
    backgroundColor: palette.surface,
  },
  errorCell: {
    borderColor: palette.danger,
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
  },

})
