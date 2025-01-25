import {useState, useEffect} from "react";
import { StyleSheet,  View, useWindowDimensions } from "react-native";
import { TabView, SceneMap } from 'react-native-tab-view';
import * as Location from "expo-location";

import CaseList from "@components/CasesComponent/CaseList";
import CaseGeolocation from "@components/CasesComponent/CaseGeolocation"

import {SECURE_USER_KEY} from '@core/constants'
import {secureGet} from '@helpers/SecureStore'




export default function CaseListScreen() {

  const [userId, setUserId] = useState(null)

  useEffect(() => {
    
    const getLocationPermission = async () => {
      const user = await secureGet(SECURE_USER_KEY)

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);

      console.log('Case List screen : ' + user)
      setUserId(user)
    };
    getLocationPermission();

  }, []);
  const [userLocation, setUserLocation] = useState(null)  
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'ListView' },
    { key: 'second', title: 'MapView' },
  ]);

  const ListView = () => (
    <CaseList reloadProp={index} userLoc = {userLocation} userId={userId}/>
);

const MapView = () => (
   <CaseGeolocation reloadProp={index} userLoc = {userLocation} userId={userId}/>
);

const renderScene = SceneMap({
  first: ListView,
  second: MapView,
});
if (!userId) {
  return (<></>)
}
  return (

    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      tabBarPosition= "bottom"
      options={{unmountOnBlur: true}}
    />

    
  );
}
const styles = StyleSheet.create({
  container: {
    flex:1,
    marginTop: 50
    
  }
});
