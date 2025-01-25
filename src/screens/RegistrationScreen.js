import React, {useState, useEffect} from 'react'
import { StyleSheet, View, Text, PermissionsAndroid, TouchableOpacity } from 'react-native';
import Background from '@components/UI/Background';
import { Padder } from '@components/UI/Wrapper';
import Logo from '@components/UI/Logo'
import Header from '@components/UI/Header'
import Button from '@components/UI/Button'
import LoadingModalWrapper from '@components/UI/LoadingModal';
import { useDispatch, useSelector } from 'react-redux'
import { AntDesign } from '@expo/vector-icons';
import TextInput from '@components/UI/TextInput'
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { Dropdown } from 'react-native-element-dropdown';

import * as Application from 'expo-application';
import { Platform } from 'expo-modules-core';
import RegistrationImageScanner from '@components/AuthComponent/RegistrationImageScanner'

import {requestRegisterUser} from '@store/ducks/userSlice'
import { theme } from '../core/theme'
import { SECURE_USER_KEY, SECURE_USER_PIN, REGISTRATION_ERROR_MESSAGE} from '../core/constants'
import {secureSave, secureGet} from '@helpers/SecureStore'
import { ALERT_TYPE, Dialog, Toast} from 'react-native-alert-notification';
//import DeviceNumber from 'react-native-device-number';
//import {   getHash, requestHint,  startOtpListener,  useOtpVerify,} from 'react-native-otp-verify';
//import SmsRetriever from 'react-native-sms-retriever';
import Stepper from '../components/UI/Stepper';

const CELL_COUNT = 4;
let step = 0
export default function RegistrationScreen({ route, navigation }) {


  //const userTracker = route.params && route.params.lastState ? <UserTracker displayCoordinates={false}/> : null
    let isLoading = useSelector((state) => state.user.loading);
    let userId = useSelector((state) => state.user.userId);
    let auth = useSelector((state) => state.user.auth)
    let error = useSelector((state) => state.user.error)
    let registrationStepComplete = useSelector((state) => state.user.isRegistered);
    let [isLoadingSms, setIsLoadSms] = useState(false)

    const dispatch = useDispatch()

    const [registeredPhoneNumber, setRegisteredPhoneNumber] = useState('')
    const [pin, setPin] = useState('')
    const [pinValidated, setIsPinValidated] = useState(false)
    const ref = useBlurOnFulfill({pin, cellCount: CELL_COUNT});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
      pin,
      setPin,
    });

    const [errorRegistration, setErrorRegistration] = useState(false)

    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [countryCode, setCountryCode] = useState('');

    const countryCodeDropdown = [
      { label: '+91', value: '+91' },
      { label: '+61', value: '+61' },
      { label: '+1', value: '+1' }]

    useEffect(()=> {
      setIsPinValidated(false)
    },[])

    useEffect(()=> {
      if (isLoading !== true && error === REGISTRATION_ERROR_MESSAGE) {
        setErrorRegistration(true)
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: 'Registration Failed',
          textBody: 'Please contact admin',
          button: 'OK',          
          onHide: () => { 
            setRegisteredPhoneNumber('')
            setErrorRegistration(true)
          }
        })
      }  
    },[isLoading, error])
 
  const getPhoneNumber = async => {
    (async () => {
      await getUserPhoneNumber()
    })()
  }


  const getUserPhoneNumber = async () => {
    
    
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
        {
          title: 'iCheckfy Phone State Permission',
          message:
            'Needed to get you phone details ',

          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log(`checking permissions ${granted}`)   
      
       
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        try {
          const phoneNumber = '' //SmsRetriever.requestPhoneNumber();
          console.log(`Phone no is ${phoneNumber}`)
          setRegisteredPhoneNumber(phoneNumber)
        } catch (error) {
          console.log(JSON.stringify(error));
        }
        
      }
    } catch (err) {
      console.warn(err);
    }
  }

  _onSmsListenerPressed = async () => {
    try {

      const grantedRcv = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        {
          title: 'iCheckfy SMS Permission',
          message:
            'Needed to get you phone details ',

          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      /*const grantedRead = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'iCheckfy SMS Permission',
          message:
            'Needed to get you phone details ',

          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log('SMS listner')
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
        SmsRetriever.addSmsListener(event => {
          console.log(event.message);
          SmsRetriever.removeSmsListener();
        }); 
      }*/
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  };

  const registerUser = async () => {
 
    if (Platform.OS === 'android') {
      console.log(Application.getAndroidId())
      const dataToSendForReg = {
        phoneNo: countryCode+registeredPhoneNumber.replace(/\s/g, ''),
        deviceId: Application.getAndroidId(),
        step: 1
      }
      dispatch(requestRegisterUser(dataToSendForReg))
      _onSmsListenerPressed()
    }
   }

  

   const vaildateOtp = async ()  => { 
    
    if (Platform.OS === 'android') {
      secureSave(SECURE_USER_PIN,auth)
      secureSave(SECURE_USER_KEY,userId)

      if(auth === pin.toString()) {
        //navigation.navigate('Login')
        
        setIsLoadSms(true)
        setTimeout(() => {
          setIsLoadSms(false)
          setIsPinValidated(true)
          const dataToSendForReg = {
            step: 2
          }
          dispatch(requestRegisterUser(dataToSendForReg))
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: 'OTP validated successfully',
          })
        }, 2000);

      } else {

        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: 'INCORRECT PIN',
          textBody: 'PLEASE TRY AGAIN...',
          button: 'Close',          
          onHide: () => { 
            setPin('')
          }
        })        
      }  

    }

   }

  if(registrationStepComplete !== null || registrationStepComplete !== undefined)
    step = registrationStepComplete
    
    return (
      <LoadingModalWrapper shouldModalBeVisible = {isLoading || isLoadingSms}>
          <Background>
          <Padder>

            <Logo />
            <Header>REGISTRATION</Header>

             <Stepper stepComplete={step}/>
            
            {step === 0 && 
            <>
            <View style= {Styles.phoneNoContainer}>
            <Dropdown
               style={Styles.dropdown}
               placeholderStyle={Styles.placeholderStyle}
                selectedTextStyle={Styles.selectedTextStyle}
                inputSearchStyle={Styles.inputSearchStyle}
                iconStyle={Styles.iconStyle}
                data={countryCodeDropdown}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select item"
                searchPlaceholder="Search..."
                value={countryCode}
                onChange={item => {
                  setCountryCode(item.value);
                }}
                renderLeftIcon={() => (
                  <AntDesign style={Styles.icon} color="black" name="phone" size={20} />
                )}/>
            <TextInput
                style = {Styles.phoneNoTextboxContainer}
                label= "Phone Number"
                returnKeyType="next"
                value={registeredPhoneNumber}
                //editable={false} 
                onFocus = {getUserPhoneNumber}
                onChangeText={(text) => setRegisteredPhoneNumber(text)}
                //error={!!email.error}
                //errorText={email.error}
                autoCapitalize="none"
                autoCompleteType="tel"
                textContentType="telephoneNumber"
                keyboardType="phone-pad"
                maxLength={10}
                inputStyle = {Styles.phoneNoTextbox}
              />   
            </View>
              
              
              <Button
                mode="elevated"
                //disabled = {pin.toString().length < CELL_COUNT  && emailValidator(email.value) === ''}
                disabled = {registeredPhoneNumber === ''}
                style={[Styles.button, registeredPhoneNumber === '' ? Styles.buttonDisabled : '']}
                onPress={registerUser }
                onLongPress={() => {
                  dispatch({ type: "DESTROY_SESSION" });
                 }}>
                Verify Mobile  
                <AntDesign name="phone" size={24} color="white" style={{marginLeft: 20}}/>
              </Button> 
            </>}

        {step === 1 &&
        <>
          <CodeField
            ref={ref}        
            value={pin}
            onChangeText={setPin}
            cellCount={CELL_COUNT}
            rootStyle={Styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({index, symbol, isFocused}) => (
              <Text
                key={index}
                style={[Styles.cell, isFocused && Styles.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}>
                {symbol || (isFocused ? <Cursor/> : null)}
              </Text>
            )}/>

          <Button
                mode="elevated"
                disabled = {pin.toString().length < CELL_COUNT}
                style={[Styles.button, pin.toString().length < CELL_COUNT ? Styles.buttonDisabled : '']}
                onPress={vaildateOtp }
                onLongPress={() => {
                  dispatch({ type: "DESTROY_SESSION" });
                  }} >                
                Verify OTP
              </Button>
        </>  }
                
              {step ===  2 && <RegistrationImageScanner/>}
        
          </Padder>
          
        </Background>
      </LoadingModalWrapper>
      
    )
  }

  const Styles = StyleSheet.create({
    button: {
      marginTop: 70
    },
    buttonDisabled : {
      backgroundColor: theme.colors.disabledPrimary,
      opacity: 0.5
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

    phoneNoContainer: {
      width: '80%',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row'
    } ,
    dropdown: {
      margin: 16,
      marginRight: 5,
      height: 60,
      width: 90,
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderBottomColor: 'gray',
      borderBottomWidth: 0.5,
    },
    icon: {
      marginRight: 5,
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
      fontWeight: '900'
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    phoneNoTextboxContainer: {
      width: '80%',
      marginVertical: 12,
      fontSize: 20,
      marginHorizontal: 1
      
    },
    phoneNoTextbox : {
      fontWeight: '900',
      fontSize: 20
    }
    
  });