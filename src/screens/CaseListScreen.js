import {useState, useEffect} from "react";
import { StyleSheet,  View, useWindowDimensions } from "react-native";
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import * as Location from "expo-location";

import CaseList from "@components/CasesComponent/CaseList";
import CaseGeolocation from "@components/CasesComponent/CaseGeolocation"

import { useNavigation } from '@react-navigation/native';
import {SECURE_USER_KEY, SCREENS} from '@core/constants'
import {secureGet} from '@helpers/SecureStore'
import { palette } from '@core/theme'




export default function CaseListScreen() {

  const [userId, setUserId] = useState(null)
  const [userLocation, setUserLocation] = useState(null)  
  const layout = useWindowDimensions();
  const navigation = useNavigation();

  useEffect(() => {
    
    const getLocation = async () => {
      const user = await secureGet(SECURE_USER_KEY)
      console.log('Case List screen : ' + user)
      if (!user) {
        // No stored user (e.g. SecureStore lost on reinstall) - let Login decide where to go
        navigation.reset({index: 0, routes: [{name: SCREENS.Login}]})
        return
      }
      setUserId(user)

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let locationPromise = Location.getLastKnownPositionAsync({});
      setUserLocation(locationPromise);
    };
    getLocation();

  }, []);
  

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'List' },
    { key: 'second', title: 'Map' },
  ]);

  const ListView = () => (
    <CaseList reloadProp={index} userLocPromise = {userLocation} userId={userId}/>
);

const MapView = () => (
   <CaseGeolocation reloadProp={index} userLocPromise = {userLocation} userId={userId}/>
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
      renderTabBar={(props) => (
        <TabBar
          {...props}
          style={styles.tabBar}
          indicatorStyle={styles.tabIndicator}
          activeColor={palette.primary}
          inactiveColor={palette.muted}
        />
      )}
      commonOptions={{
        labelStyle: styles.tabLabel,
        icon: ({ route, color }) => (
          <Ionicons name={route.key === 'first' ? 'list' : 'map-outline'} size={20} color={color} />
        ),
      }}
    />

    
  );
}
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: palette.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabIndicator: {
    backgroundColor: palette.primary,
    height: 3,
    top: 0,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'none',
  },
});
