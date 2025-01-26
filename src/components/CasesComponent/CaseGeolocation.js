import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,

} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { useIsFocused } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux';
import { Searchbar } from 'react-native-paper';
import {requestCasesCoordinates} from '@store/ducks/cases-slice'
import MapCallout from '../UI/MapCallout'


import Background from "@components/UI/Background";
import { GEOFENCING_RADIUS_IN_METRES } from "@core/constants";


const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;


const CaseGeolocation = ({reloadProp, userLoc, userId}) => {

  let caseMarkers = useSelector((state) => state.cases.caseCoordinates);
  let cases = useSelector((state) => state.cases.cases);
  const isLoading = useSelector((state) => state.cases.loading)
  const error = useSelector((state) => state.cases.error)
  const isConnected = useSelector(state => state.network.isConnected);
  //const userId = useSelector(state => state.user.userId)
  const [searchQuery, setSearchQuery] = useState('');


  const dispatch = useDispatch()
  const isFocused = useIsFocused()


  const [initialRegion, setInitialRegion] = useState({
    latitude: userLoc.latitude,
    longitude:  userLoc.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

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


  useEffect(() => {
    if (isFocused && isConnected && userId) {
      console.log('Fetching coordinates')
      dispatch(requestCasesCoordinates(userId))        
    }  

  }, [dispatch, isFocused])

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
            <MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={styles.map} initialRegion={initialRegion}  
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