import { useState, useEffect } from 'react'
import { Text, View } from 'react-native'
import * as LA from 'react-native-local-auth'
import { useDispatch} from 'react-redux'
import {requestValidateUser, requestValidateUserAuto, navigateFromHomePage} from '@store/ducks/userSlice'
import {secureGet} from '@helpers/SecureStore'
import {SECURE_USER_KEY} from '@core/constants'

const LocalAuthComponent = ({setBiometicCancelled}) => {

    const [isBiometricSupported, setIsBiometricSupported] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState('')
    const [authCalled, setAuthCalled] = useState(false)

    let dispatch = useDispatch();


    const onAuthenticate = () => {
        setAuthCalled(true)
        try {            
            const auth = LA.authenticate({
                reason: 'this is a secure area, please authenticate yourself',
                fallbackToPasscode: true,    // fallback to passcode on cancel
                suppressEnterPassword: false // disallow Enter Password fallback
              })
           
            auth.then(success => {
               
                const dataToSendForAuth = {
                    emailId: user,
                    password: '__BIOMETRIC__'
                    }                                                   
                    dispatch(requestValidateUser(dataToSendForAuth))
            }).catch(error => {
                setBiometicCancelled(true)
              })

        }  catch(error){
            console.log(error)
            setBiometicCancelled(true)
        }
    }


    useEffect( () => {


        (async ()=> {
            //Check device compatibility for biometric
            //const compatible = await LA.hasHardwareAsync()     
            const email = await secureGet(SECURE_USER_KEY)                     
            setUser(email)
        })()        
    },[])


    return (<View>{!authCalled && user !== '' && onAuthenticate()}</View>)

}

export default LocalAuthComponent;