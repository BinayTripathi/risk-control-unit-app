import {useState, useEffect} from "react";
import { StyleSheet,  View, FlatList, RefreshControl, Alert } from "react-native";
import { Searchbar } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux';
import Background from "@components/UI/Background";
import Paragraph from '@components/UI/Paragraph'
import CaseItem from "@components/CasesComponent/CaseItem";
import Button from "@components/UI/Button"

import {requestCases, requestCasesOffline} from '@store/ducks/cases-slice'
import { Padder } from "../UI/Wrapper";

export default function CaseList({userLoc,userId}) {
  
  let cases = useSelector((state) => state.cases.cases);
  let caseMarkers = useSelector((state) => state.cases.caseCoordinates);
  const isLoading = useSelector((state) => state.cases.loading)
  const error = useSelector((state) => state.cases.error)
  const isConnected = useSelector(state => state.network.isConnected);
  
  const dispatch = useDispatch()
  const isFocused = useIsFocused()

  const [refreshInterval, setRefreshInterval] = useState(1000*300);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(true);
  const [forceRerender, setForceRerender] = useState('')

  console.log(`CASES Length - ${cases.length}`)
  const onChangeSearch = query => setSearchQuery(query);
 
  const dispatchFetchRequest = async () => {
      setRefreshing(true)
      console.log('Fetching list')    
      dispatch(requestCases(userId))  
      setRefreshing(false)   
  }

  useEffect(() => {
    console.log('List screen' + userId)
    if (isFocused && userId) {
       if(isConnected) {
        
        dispatchFetchRequest();
       }          
        else  {
          const offlineCases = {
            cases
          }
          dispatch(requestCasesOffline(offlineCases)) 
        }
    }  
  }, [dispatch, isFocused, forceRerender])

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
  

  function renderClaimItem(itemData) {
    return(     
          <CaseItem caseDetails = {itemData.item} userLoc = {userLoc}/>    
    )
  }

  const searchCasesByName = (caseToCheck) => {
    console.log(`SEARCH QUERY - ${searchQuery}`)
    if(searchQuery.length !== '')
      return caseToCheck.customerName.startsWith(searchQuery) || 
              caseToCheck.policyNumber.startsWith(searchQuery)
    
    return true
  }

  const retriveAllCases = () => {

    caseMarkers = mergeByClaimId(caseMarkers,cases) 
    console.log(`Markers Length - ${caseMarkers.length}`)
    //return cases !== undefined ?cases.filter(searchCasesByName).reverse() : null;
    var caseM = caseMarkers !== undefined ?caseMarkers.filter(searchCasesByName).reverse() : null;
    console.log(`CASEM Length - ${caseM.length}`)
    return caseM
  }

  let casesToShow = <View style = {{paddingTop: 20}}>
      <Paragraph>
        NO CASES TO DISPLAY
      </Paragraph>
      <Button mode="elevated" style={[styles.refreshButton]} 
                            onPress={() => setForceRerender((Math.random() + 1).toString(36).substring(7))}>
                              REFRESH </Button>
    </View>
  if(retriveAllCases() !== null && retriveAllCases().length != 0 && retriveAllCases()[0].customerName !== undefined) {
    casesToShow =    <FlatList data={retriveAllCases()} 
                      renderItem={renderClaimItem} 
                      keyExtractor={(item) => item.claimId}
                      refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={dispatchFetchRequest} />
                      }/>
           
  }

  return (
    <LoadingModalWrapper shouldModalBeVisible = {isLoading}>
      <Background>      
        <Padder>
          <View style= {styles.container}>

              <View style= {styles.searchBoxContainer}>
                  <Searchbar
                        placeholder="Search By Name/Policy"
                        onChangeText={onChangeSearch}
                        value={searchQuery}/>
              </View>
              <View style= {styles.listsContainer}>
                  {isLoading ? null : casesToShow}
              </View>      
          </View> 
        </Padder>
              
        
      </Background>
    </LoadingModalWrapper>
  );
}
const styles = StyleSheet.create({
  container: {
    flex:1,
    marginTop: 90,      
    justifyContent: 'center',
    paddingBottom: 10
  },
  searchBoxContainer : {
    flex: 1,
    width: 320
  },
  listsContainer : {   
    flex: 9,
    padding: 2,
    paddingTop: 25,
    alignItems: 'center',    
  },
  searchBox: {
    width: 320
  },
  refreshButton : {
    marginRight: 5,
    marginBottom: 10,
    alignSelf: "center"
  },

});
