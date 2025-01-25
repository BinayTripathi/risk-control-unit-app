import { useState } from 'react'
import { StyleSheet,View, Text , Dimensions,  ScrollView} from 'react-native';
import  { useSelector } from 'react-redux';


import PhotoIdScanner from './InvestigationDetails/PhotoIdScanner'
import DocumentScanner from './InvestigationDetails/DocumentScanner'
import FormInitiator from './InvestigationDetails/FormInitiator'
import { theme } from "@core/theme";
import {UPLOAD_TYPE} from '@core/constants'


const { width, height } = Dimensions.get('window');

export default InvestigationDetails = function ({selectedClaimId, userId, capability}) {
 
  let allCaseUpdates = useSelector((state) => state.casesUpdates.casesUpdates);
  let loading = useSelector((state) => state.casesUpdates.loading);
  let err = useSelector((state) => state.casesUpdates.error);
  const caseUpdates = allCaseUpdates[selectedClaimId]

    return (   
   
        <View style={styles.container}>
          

          
          <ScrollView> 
          {capability === UPLOAD_TYPE.PHOTO && <PhotoIdScanner selectedClaimId = {selectedClaimId}  userId = {userId} caseUpdates = {caseUpdates}/> }
          {capability === UPLOAD_TYPE.DOCUMENT && <DocumentScanner selectedClaimId = {selectedClaimId}  userId = {userId} caseUpdates = {caseUpdates}/> }
          {capability === UPLOAD_TYPE.FORM &&  <FormInitiator selectedClaimId = {selectedClaimId}  userId = {userId} caseUpdates = {caseUpdates}/> }

          </ScrollView>
        </View>
        

 
    );

    
}

const styles = StyleSheet.create({
  container: {
    height: height,
    overflow: 'hidden',
    alignItems: "center",    
    paddingHorizontal: 5,
    padding: 50,
  },
  descriptionContainer : {
    marginTop: 40,
    
  } ,
  textBase: {
   color: '#050505',
  },
  description: {
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(22, 6, 96, 0.75)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 20,
  },  
 
})

