import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator 
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { useIsFocused } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux';
import { Searchbar } from 'react-native-paper';
import MapCallout from '../UI/MapCallout'


import Background from "@components/UI/Background";
import { GEOFENCING_RADIUS_IN_METRES } from "@core/constants";


const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;


const CaseGeolocation = ({reloadProp, userLocPromise, userId}) => {

  let caseMarkers = useSelector((state) => state.cases.caseCoordinates);
  let cases = useSelector((state) => state.cases.cases);
  const isLoading = useSelector((state) => state.cases.loading)
  const error = useSelector((state) => state.cases.error)
  const isConnected = useSelector(state => state.network.isConnected);
  //const userId = useSelector(state => state.user.userId)
  const [searchQuery, setSearchQuery] = useState('');

  const [userLoc, setUserLoc] = useState(null)


  const dispatch = useDispatch()
  const isFocused = useIsFocused()


  const [initialRegion, setInitialRegion] = useState(null);

  const mapRef = useRef(null);
  const timeout = 400;
 

  const mergeByClaimId= (a1, a2) => {
    if(a1 === undefined && a2 !== undefined)
      return a2
    else if(a1 !== undefined && a2 === undefined)
      return a1
    else if(a1 === undefined && a2 === undefined)
      return undefined
    return a1.map(itm => ({
        ...a2.find((item) => (item.claimId === itm.claimId) && item),
        ...itm
    }));
  }

  console.log('promise resolved' + userLocPromise)
  useEffect(() => {
    
    let isMounted = true;
    let awaitUserPromise = async () => {
    const userLocBlocked = await userLocPromise
    console.log(userLocBlocked)
     
    if (isMounted) {
      setUserLoc({
        latitude: userLocBlocked.coords.latitude,
        longitude: userLocBlocked.coords.latitude
      })


      setInitialRegion({
        latitude: userLocBlocked.coords.latitude,
        longitude: userLocBlocked.coords.latitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      })
    }    
  } 
    awaitUserPromise();

    return () => {
      isMounted = false; // Clean up
    };

  }, [userLocPromise])

  useEffect(() => {
    if (mapRef.current && initialRegion) {
      mapRef.current.animateToRegion(initialRegion, 1000); // 1000 ms animation duration
    }
  }, [initialRegion]);
  

  const onChangeSearch = query => setSearchQuery(query);

  const searchCasesByName = (caseToCheck) => {
    if(searchQuery.length != 0)
      return caseToCheck.policyNumber.startsWith(searchQuery) || caseToCheck?.customerName.startsWith(searchQuery)
    
    return true
  }

  const retriveAllCases = () => {
    caseMarkers = mergeByClaimId(caseMarkers,cases)  
    return caseMarkers !== undefined ?caseMarkers.filter(searchCasesByName).reverse() : null;
  }

  const focusMap = (focusMarkers, animated) => {
    if(userLoc !== null) focusMarkers.push("USER_LOC")
    //console.log(`Markers received to populate map: ${focusMarkers}`);
    setTimeout(() => {mapRef?.current?.fitToSuppliedMarkers(focusMarkers, animated)},10)
    
  }
  const autoFocus = () => {
      if (mapRef.current) {       
        animationTimeout = setTimeout(() => { focusMap(retriveAllCases().map((eachCase) => eachCase.claimId ), true) , timeout });
    }
  }

  let mapMarkers = () => {

    if(retriveAllCases() === null || retriveAllCases().length === 0 || retriveAllCases()[0]?.coordinate === undefined) return null
  

    let allMarkers =  retriveAllCases().map((eachCase) => 
        <Marker key ={eachCase.claimId} 
                identifier={eachCase.claimId}
                coordinate={{ latitude:eachCase.coordinate.lat, longitude: eachCase.coordinate.lng }}
                title={eachCase.policyNumber} description={eachCase.address}>
                  <MapCallout title={eachCase.policyNumber} description={eachCase.address} claimId={eachCase.claimId}></MapCallout>
                </Marker >) 

        if(userLoc !== null) {
          //console.log(userLoc)
          allMarkers.push(<Marker key ={"USER_LOC"} 
            identifier={"USER_LOC"} 
            coordinate={userLoc}
            title={"You are here"}/>)
        }

        return allMarkers

    }


    let geoFencing = () => {
    return  retriveAllCases().map(eachCase => <Circle
      key ={eachCase.claimId} 
        center={{ latitude:eachCase.coordinate.lat, longitude: eachCase.coordinate.lng }}
        radius={GEOFENCING_RADIUS_IN_METRES}
        strokeWidth = { 1 }
                strokeColor = { '#1a66ff' }
                fillColor = { 'rgba(230,238,255,0.5)' }
      />)
    }


  
    if (!initialRegion) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    } else console.log(initialRegion)
    

  return (
    
    <Background>
      
      <View style={styles.container}>

         <View style= {styles.searchBoxContainer}>
                  <Searchbar placeholder="Search By Name/Policy"
                        onChangeText={onChangeSearch}
                        value={searchQuery}/>
        </View>

        <View style={styles.mapContainer}>

          {initialRegion !== null && (
            <MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={styles.map} initialRegion={{"latitude": -37.8263242, "latitudeDelta": 0.005, "longitude": -37.8263242, "longitudeDelta": 0.005}}  
            key={userLoc}
            maxZoomLevel={15} 
            showsUserLocation = {true}
            followsUserLocation = {true}
            mapPadding={{ top: 100, right: 100, bottom: 100, left: 100 }} 
            onMapReady={() => autoFocus()}>
              
            {true && (<View>
                
                
                {mapMarkers()}
                {geoFencing()}
                  
              </View>
              )}
            </MapView>
          )}          
        </View>
      </View>      
    </Background>
  );
};

const styles = StyleSheet.create({

  container: {
    flex:1,
    marginTop: 90,      
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },

  searchBoxContainer : {
    flex: 1,
    width: 320,
    height: 40,
    alignContent: 'center',
  },
  searchBox: {
    width: 320
  },
  mapContainer: { 
    marginTop:30,   
    flex: 9,
    width:  windowWidth *0.95,
    padding: 0,       
    alignContent: 'center',
    borderRadius: 8,
    overflow: 'hidden'
  },
  map: {
    width : '100%' ,
    height : '100%' ,
    borderRadius: 10,
    borderWidth: 1
  },
  
});

export default CaseGeolocation;