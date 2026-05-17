import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer,  } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux'
import Logout from '@components/AuthComponent/LogoutComponent';
import HeaderHamburger from '@components/NavigationComponent/HeaderHamburger';
import Drawer from '@components/NavigationComponent/Drawer';
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
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [panResponder] = useInactivityMonitor(navState)

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  
  return (
    <NavigationContainer  ref={navigationRef}>
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
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
              setDrawerVisible(false); // Close drawer on navigation
              //console.log('state changed', e.data);
            },
          }}
          >      
        

          {registrationStepComplete < 3 && <Stack.Screen name={SCREENS.RegistrationScreen} component={RegistrationScreen}  options={{headerShown: false}}/>}
           <Stack.Screen name={SCREENS.Login} component={LoginScreen} />
          <Stack.Screen name={SCREENS.CaseList} component={CaseListScreen} options={
            {title: 'Your Case List',
            headerRight : () => (
              <HeaderHamburger onPress={toggleDrawer}/>
            ),
            headerStyle: {
              backgroundColor: 'transparent',
            },
            
          }
          } /> 
            <Stack.Screen name={SCREENS.CaseDetailsScreen} component={CaseDetailsScreen} options={
            {title: 'Case Details',
            headerRight : () => (
              <HeaderHamburger onPress={toggleDrawer}/>
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
                <HeaderHamburger onPress={toggleDrawer}/>
              ),
          }}/>                         
          </Stack.Navigator>
          <Drawer visible={drawerVisible} onClose={toggleDrawer} />
        </View>
      </NavigationContainer>
  )

}