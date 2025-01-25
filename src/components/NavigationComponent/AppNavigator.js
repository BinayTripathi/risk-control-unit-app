import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer,  } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux'
import Logout from '@components/AuthComponent/LogoutComponent';
import {navigationRef} from '@services/NavigationService'

import { SCREENS } from '@core/constants';
import RegistrationScreen from '@screens/RegistrationScreen';
import LoginScreen from '@screens/LoginScreen';
import CaseListScreen from '@screens/CaseListScreen';
import CaseDetailsScreen from '@screens/CaseDetailsScreen';
import ImageCaptureScreen from '@screens/ImageCaptureScreen';
import useInactivityMonitor from '@hooks/useInactivityMonitor';


export default function AppNavigator() {

  const Stack = createNativeStackNavigator();
  let userId = useSelector((state) => state.user.userId)
   
  let registrationStepComplete = useSelector((state) => state.user.isRegistered);
  const [navState, setNavState] = useState()

  const [panResponder] = useInactivityMonitor(navState)
  
  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <NavigationContainer  ref={navigationRef}>
              <Stack.Navigator 
                screenOptions={{
                  headerShown: true,
                  animation: 'fade',
                  headerTransparent: true,
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
                screenListeners={{
                  state: (e) => {
                    setNavState(e.data)
                    //console.log('state changed', e.data);
                  },
                }}
                >      
              

                {registrationStepComplete < 3 && <Stack.Screen name={SCREENS.RegistrationScreen} component={RegistrationScreen}  options={{headerShown: false}}/>}
                 <Stack.Screen name={SCREENS.Login} component={LoginScreen} />
                <Stack.Screen name={SCREENS.CaseList} component={CaseListScreen} options={
                  {title: 'Your Case List',
                  headerRight : () => (
                    <Logout/>
                  ),
                  headerStyle: {
                    backgroundColor: 'transparent',
                  },
                  
                }
                } /> 
                  <Stack.Screen name={SCREENS.CaseDetailsScreen} component={CaseDetailsScreen} options={
                  {title: 'Case Details',
                  headerRight : () => (
                    <Logout/>
                  ),
                  headerStyle: {
                    backgroundColor: 'transparent'//theme.colors.gradientALight,
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }
                } /> 
                <Stack.Screen name={SCREENS.ImageCaptureScreen} component={ImageCaptureScreen} options={
                  {
                    title: 'Capture Image',
                    headerRight : () => (
                      <Logout/>
                    ),
                }}/>                         
                </Stack.Navigator>
            </NavigationContainer>
          </View>
  )

}