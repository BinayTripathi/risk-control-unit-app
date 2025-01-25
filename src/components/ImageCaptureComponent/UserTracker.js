import { useEffect , useState} from "react";
import { View, Text, Alert, StyleSheet, ImageBackground, Image } from "react-native";

import {
    getLastKnownPositionAsync,
    getCurrentPositionAsync,
    requestForegroundPermissionsAsync,
    PermissionStatus,
  } from 'expo-location';

  import {getMapPreview} from '../../helpers/getMapPreview'
import ModalComponent from "../UI/ModalComponent";

const generateDateTime = () => {
    const date = new Date();
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes(); //Current Minutes
    var sec = new Date().getSeconds(); //Current Seconds
    const day = date.getDate();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${day} - ${month} - ${year} ${hours}:${min}:${sec}`;
  }

function UserTracker({photoData, displayMapHandler, shouldDisplayMap}) {

    //GPS
    const [gps, setGps] = useState(null);  
    const [dateTime, setDateTime] = useState('')
    const [isVisible, setIsVisible] = useState(false)



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

        setDateTime(generateDateTime())
       
      }
      getUserLocation()
  },[])

   useEffect( () => {
    if(dateTime && gps) {
        console.log(`Date Time : ${dateTime}`)
        console.log(`Location : ${gps.latitude} / ${gps.longitude}`)
    }
    
  }, [dateTime,gps, photoData])
  //https://stackoverflow.com/questions/54967931/blur-in-default-modal-of-react-native
  const displayCoordintes = photoData? (
    
        <View style={styles.gps}>
          {gps  ? (                     
                <ModalComponent displayMapHandler = {displayMapHandler} diplayModal = {shouldDisplayMap}>                        
                  <View style={styles.mapPreview}>          
                    <Image style={styles.image} resizeMode={'cover'} source={{uri: getMapPreview(gps.latitude, gps.longitude)}}/>
                  </View>              
                </ModalComponent>             
          ) : (
            <View>
              <Text>Waiting...</Text>
            </View>
          )}      
        </View>
      
  ) : null;
 

  return (
    
    displayCoordintes
   
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
   mapPreview: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#aaa7a7',
    overflow: 'hidden',
    elevation: 4,
    borderRadius: 10,
    opacity: 0.9
  },
  image: {
    //width: '100%',
    //height: '100%',
    flex: 1
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#606070',
    margin: 50,
  },
  text: {
    color: '#3f2949',
    marginTop: 10,
  },
  
});



export default UserTracker;
