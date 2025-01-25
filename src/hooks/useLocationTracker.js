import { useState, useEffect } from "react";
import {
    getLastKnownPositionAsync,
    getCurrentPositionAsync,
    requestForegroundPermissionsAsync,
    PermissionStatus,
  } from 'expo-location';

const useLocationTracker = () => {

    const [gps, setGps] = useState(null);  


    useEffect(()=> {
        async function getUserLocation() {
            let locationPermissionInformation = await requestForegroundPermissionsAsync();
            if (locationPermissionInformation.status === PermissionStatus.UNDETERMINED) {
              const permissionResponse = await requestPermission();
              console.log('Permission granted')         
            }
        
            if (locationPermissionInformation.status === PermissionStatus.DENIED) {
              Alert.alert(
                'Insufficient Permissions!',
                'You need to grant location permissions to use this app.'
              );   
             return false
            }
    
            let location = await getLastKnownPositionAsync({});
            if (!gps) {
              setGps(location.coords);
            }
        
            let currentLocation = await getCurrentPositionAsync({});
        
            if (gps && currentLocation.coords.latitude !== gps.latitude) {
              setGps(currentLocation.coords);
            }     
           
          }

          getUserLocation()
      },[])


      return `${gps?.latitude} / ${gps?.longitude}`

}

export default useLocationTracker