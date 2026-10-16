import {useState, useEffect} from "react";
import { StyleSheet,  View, Text, FlatList, RefreshControl } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Searchbar } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux';
import Background from "@components/UI/Background";
import CaseItem from "@components/CasesComponent/CaseItem";
import Button from "@components/UI/Button"

import {requestCases, requestCasesOffline, requestCasesCoordinates} from '@store/ducks/cases-slice'
import { palette, radius, spacing, typography } from '@core/theme';

export default function CaseList({userLocPromise,userId}) {
  
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
      dispatch(requestCasesCoordinates(userId))
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
          dispatch(requestCasesCoordinates(userId))
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
          <CaseItem caseDetails = {itemData.item} userLocPromise = {userLocPromise} caseIndex = {itemData.index}/>    
    )
  }

  const searchCasesByName = (caseToCheck) => {
    console.log(`SEARCH QUERY - ${searchQuery}`)
    if(searchQuery.length !== '')
      return caseToCheck.customerName?.startsWith(searchQuery) || 
              caseToCheck.policyNumber?.startsWith(searchQuery)
    
    return true
  }

  const retriveAllCases = () => {

    caseMarkers = mergeByClaimId(caseMarkers,cases) 
    console.log(`Markers Length - ${caseMarkers.length}`)
    //return cases !== undefined ?cases.filter(searchCasesByName).reverse() : null;
    var caseM = caseMarkers !== undefined ?caseMarkers.filter(searchCasesByName).reverse().slice(0,5) : null;
    console.log(`CASEM Length - ${caseM.length}`)
    return caseM
  }

  let casesToShow = <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="folder-open-outline" size={32} color={palette.primary} />
      </View>
      <Text style={styles.emptyTitle}>No cases to show</Text>
      <Text style={styles.emptyText}>{searchQuery ? 'No cases match your search.' : 'New cases assigned to you will appear here.'}</Text>
      <Button mode="outlined" variant="secondary" icon="refresh" style={styles.refreshButton}
                            onPress={() => setForceRerender((Math.random() + 1).toString(36).substring(7))}>
                              Refresh</Button>
    </View>
  if(retriveAllCases() !== null && retriveAllCases().length != 0 && retriveAllCases()[0].customerName !== undefined) {
    casesToShow =    <FlatList data={retriveAllCases()}
                      style={styles.list}
                      contentContainerStyle={styles.listContent}
                      renderItem={renderClaimItem}
                      keyExtractor={(item) => item.claimId}
                      refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={dispatchFetchRequest} colors={[palette.primary]} />
                      }/>

  }

  return (
    <LoadingModalWrapper shouldModalBeVisible = {isLoading}>
      <Background>
          <View style= {styles.container}>
              <View style= {styles.searchBoxContainer}>
                  <Searchbar
                        placeholder="Search by name or policy"
                        onChangeText={onChangeSearch}
                        value={searchQuery}
                        style={styles.searchBox}
                        inputStyle={styles.searchInput}
                        iconColor={palette.subText}
                        placeholderTextColor={palette.muted}
                        elevation={0}/>
              </View>
              <View style= {styles.listsContainer}>
                  {isLoading ? null : casesToShow}
              </View>
          </View>
      </Background>
    </LoadingModalWrapper>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  searchBoxContainer : {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchBox: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    height: 48,
  },
  searchInput: {
    fontSize: 15,
    color: palette.text,
    minHeight: 0,
  },
  listsContainer : {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl * 2,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.heading,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: palette.subText,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  refreshButton : {
    width: 160,
  },
});
