import { useState } from 'react'
import { StyleSheet,View, Text , Dimensions,  ScrollView} from 'react-native';
import  { useSelector } from 'react-redux';

import CollapsibleSection from '@components/UI/CollapsableSection'
import PhotoIdScanner from './InvestigationDetails/PhotoIdScanner'
import DocumentScanner from './InvestigationDetails/DocumentScanner'
import FormInitiator from './InvestigationDetails/FormInitiator'


const { width, height } = Dimensions.get('window');

export default InvestigationDetails = function ({selectedClaimId, userId, sectionFromTemplate}) {
 
  let allCaseUpdates = useSelector((state) => state.casesUpdates.casesUpdates);
  let loading = useSelector((state) => state.casesUpdates.loading);
  let err = useSelector((state) => state.casesUpdates.error);
  const caseUpdates = allCaseUpdates[selectedClaimId]

    return (   

      <View style = {styles.container}>    
        <View style = {styles.descriptionContainer}>
                <Text style = {[styles.textBase, styles.description ]}>{sectionFromTemplate.locationName} </Text>
        </View> 
        
        <ScrollView style={styles.scrollView}>

            <CollapsibleSection title="Face ID">
              <View style={styles.collapsableSectionContainer}>
                <PhotoIdScanner selectedClaimId = {selectedClaimId}  userId = {userId} caseUpdates = {caseUpdates} sectionFromTemplate = {sectionFromTemplate}/>
              </View>
            </CollapsibleSection>

            <CollapsibleSection title="Document ID">
              <View style={styles.collapsableSectionContainer}>
                  <DocumentScanner selectedClaimId = {selectedClaimId}  userId = {userId} caseUpdates = {caseUpdates} sectionFromTemplate = {sectionFromTemplate}/>
              </View>
            </CollapsibleSection>

            <CollapsibleSection title="Questionnaire">
              <View style={styles.collapsableSectionContainer}>
              <FormInitiator selectedClaimId = {selectedClaimId}  userId = {userId} caseUpdates = {caseUpdates} sectionFromTemplate = {sectionFromTemplate}/>
              </View>
            </CollapsibleSection>

            
        </ScrollView>
      </View>      

 
    );

    
}

const styles = StyleSheet.create({
  
  container: {
    height: height,
    overflow: 'hidden',
    alignItems: "center",    
    paddingHorizontal: 20,
    padding: 50
  },
  descriptionContainer : {
    marginTop: 40,
    marginBottom: 20
  } ,
  scrollView :{
    width: '100%',
    alignContent: 'center'
  },

  description: {
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(22, 6, 96, 0.75)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 20,
  }, 

  textBase: {
      color: 'black',
    },

  collapsableSectionContainer: {

    overflow: 'hidden',
    alignItems: "center",    
    paddingTop: 10,
  },
 
})

