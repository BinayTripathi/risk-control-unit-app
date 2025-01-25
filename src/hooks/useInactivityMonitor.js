import React, { useState, useEffect } from "react";
import { PanResponder , AppState} from 'react-native';
import moment from 'moment';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { useSelector, useDispatch } from 'react-redux'
import {logoutUser} from '@store/ducks/userSlice'
import {reset} from '@services/NavigationService';
import { SCREENS, SESSION_TTL_IN_SEC } from '@core/constants';

const useInactivityMonitor = (navState) => {
   
    const dispatch = useDispatch()
    const lastInteraction = React.useRef(new Date()); // Ref to store the timestamp of the last interaction
    const inactivityTimer = React.useRef(null);  // Ref to store the ID of the inactivity timer
    const IDLE_LOGOUT_TIME_LIMIT = 1 * 30 * 1000;  // Set the time limit for inactivity logout (30 sec)
    const userLoggedIn = React.useRef(false);
    const [isInactive, setInactive] = useState(false);


    let isUserLoggedIn = useSelector((state) => state.user.isLoggedIn); 

    const resetInactivityTimeout = () => {
        clearInterval(inactivityTimer.current); 
        inactivityTimer.current = null
        lastInteraction.current = new Date()
        setInactive(false)
        if(userLoggedIn.current)
            startCheckActive()
    }

    useEffect(() =>{
        userLoggedIn.current = isUserLoggedIn
    },[isUserLoggedIn])

    const panResponder = React.useRef(
            PanResponder.create({
                onStartShouldSetPanResponderCapture: () => {
                resetInactivityTimeout()
                return false
                },
            onMoveShouldSetPanResponder: () => false,
            onPanResponderTerminationRequest: () => false,
            onShouldBlockNativeResponder: () => false,
            })
        ).current;

    const checkInactive = () => {

        if (inactivityTimer.current) {
            return;
        }

        // Start the inactivity timer
        inactivityTimer.current = setInterval(() => {                
            const currentTime = moment();  // Get the current time
            const elapsedTime = moment(currentTime).diff(lastInteraction.current); // Calculate the elapsed time since the last interaction
            if (elapsedTime >= SESSION_TTL_IN_SEC.USER_SESSION) {  // Check if the elapsed time exceeds the defined time limit
                setInactive(true)
            }          
        }, 5000); // Check every second
        };

       /* React.useEffect(() => {  
            if(isLoggedIn)      
             checkInactive();// Initialize inactivity tracking when the component mounts
            return () =>{
                clearInterval(inactivityTimer.current);  // Cleanup function to clear the inactivity timer on component unmount
                resetInactivityTimeout()
            } 
        }, [isLoggedIn]);

        React.useEffect(() => {  
            if(!isLoggedIn)      
                clearInterval(inactivityTimer.current);  // Cleanup function to clear the inactivity timer on component unmount
        }, [isLoggedIn]); */

    
        /*useEffect(() => {
            if (isLoggedIn === true) {
                startCheckActive()
            } else {
                stopCheckActive()
            }
            return () => stopCheckActive()
          }, [isLoggedIn]);*/

        const startCheckActive = () => {    
             checkInactive();// Initialize inactivity tracking when the component mounts 
        }

        const stopCheckActive =() => {     
            logged = false
                 // Cleanup function to clear the inactivity timer on component unmount
                resetInactivityTimeout()
        }

        useEffect( ()=>{
            if(userLoggedIn.current)
              startCheckActive();
            else
              stopCheckActive()
          } , [userLoggedIn.current, navState])
        
        /*React.useEffect(() => {
            // Function to handle changes in app state (background/foreground)
            const handleAppStateChange = (nextAppState) => {
            // If the app is back in the foreground, reset the timeout
            if (nextAppState === 'active') {
                resetInactivityTimeout();
            }
            };
           // Subscribe to app state changes
            AppState.addEventListener('change', handleAppStateChange);
           // Cleanup function to remove the subscription when the component unmounts
     
           }, [resetInactivityTimeout]);*/


           useEffect(() => { 
            if(isInactive === true) {
                Dialog.show({
                    type: ALERT_TYPE.WARNING,
                    title: 'Logging out',
                    textBody: 'Logging out due to inactivity',
                    button: 'OK',          
                    onHide: () => { 
                        resetInactivityTimeout()
                        dispatch(logoutUser())
                        reset({
                            index: 0,
                            routes: [{ name: SCREENS.Login , params: { lastState: 'Logout' }}],
                    })
                    }
                  })
                }
    
        },[isInactive])


    return [panResponder, userLoggedIn.current, startCheckActive, stopCheckActive];
  };

  export default useInactivityMonitor