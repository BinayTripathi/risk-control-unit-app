import { useState, useEffect } from 'react'
import { Text, View } from 'react-native'
import * as LA from 'react-native-local-auth'
import { useDispatch} from 'react-redux'
import {requestValidateUser, requestValidateUserAuto, navigateFromHomePage} from '@store/ducks/userSlice'
import {secureGet, secureSave} from '@helpers/SecureStore'
import {SECURE_USER_KEY, SECURE_BEARER_TOKEN} from '@core/constants'
import {fetchJWTToken, setCachedBearerToken} from '@services/RestServiceCalls'
import useNetworkInfo from '@hooks/useNetworkInfo'

const LocalAuthComponent = ({setBiometicCancelled}) => {

    const [isBiometricSupported, setIsBiometricSupported] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState('')
    const [authCalled, setAuthCalled] = useState(false)
    const [isConnected] = useNetworkInfo()

    let dispatch = useDispatch();

    const checkInternetAndFetchToken = async () => {
        try {
            if (isConnected) {
                const token = await fetchJWTToken()
                if (token) {
                    await secureSave(SECURE_BEARER_TOKEN, token)
                    // populate in-memory cache to avoid future secure storage reads
                    setCachedBearerToken(token)
                    console.log('JWT Token stored securely')
                }
            } else {
                console.log('No internet connection available')
            }
        } catch (error) {
            console.log('Error fetching token:', error.message)
        }
    }

    const onAuthenticate = () => {
        setAuthCalled(true)
        try {            
            // Check internet and fetch JWT token during login
            checkInternetAndFetchToken()

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