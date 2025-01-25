import {useState, useEffect} from "react";
import { StyleSheet,  View, FlatList, Text } from "react-native";
import { Searchbar } from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-root-toast';
import Background from "@components/UI/Background";
import Paragraph from '@components/UI/Paragraph'
import CaseItem from "@components/CasesComponent/CaseItem";
import LoadingModalWrapper from "@components/UI/LoadingModal"
import { theme } from '@core/theme';
import InvestigationDocument from "./InvestigationDocument";

export default function InvestigationDocumentList({selectedClaimId}) { 

    let allCaseUpdates = useSelector((state) => state.casesUpdates.casesUpdates);
    let loading = useSelector((state) => state.casesUpdates.loading);
    let err = useSelector((state) => state.casesUpdates.error);
    const caseUpdates = allCaseUpdates[selectedClaimId]

    if(caseUpdates == undefined) {
    return <View style = {{paddingTop: 170}}>
        <Paragraph>
        NO DOCUMENTS TO SHOW 
        <Toast
            visible={err !== false && err !== null && err !== undefined}
            position={50}
            shadow={false}
            animation={true}
            duration={Toast.durations.SHORT}
            backgroundColor='red'
        >{err}</Toast>
        </Paragraph>
    </View> }

    const renderDocuments = ({item, index}) => (
       
        <InvestigationDocument doctype = {item.docType} 
                                photo =  {item.docType === 'PAN' ? item.OcrImage : item.locationImage}
                                ocrText = {item.OcrData}/>
    );

    if(caseUpdates.length != 0) {
        <Toast
            visible={err !== false && err !== null && err !== undefined}
            position={50}
            shadow={false}
            animation={true}
            duration={Toast.durations.SHORT}
            backgroundColor='red'
        >{err}</Toast>
        return <View style = {styles.caseUpdateContainer}>
            <FlatList data={caseUpdates} 
                        renderItem={renderDocuments} 
                        keyExtractor={(item, index) => item.docType + `-Page ${index+1}`}/>
            </View>
            
    }

    return   <>
    <Toast
            visible={err !== false && err !== null && err !== undefined}
            position={50}
            shadow={false}
            animation={true}
            duration={Toast.durations.SHORT}
            backgroundColor='red'
        >{err}</Toast>
        <LoadingModalWrapper shouldModalBeVisible = {loading}> {documentsToShow} </LoadingModalWrapper>
    </>
    


}

const styles = StyleSheet.create({
    caseUpdateContainer: {
      padding: 10,
      alignItems: 'center',
      justifyContent: "space-between",
      width: '100%',      
      backgroundColor: theme.colors.updateDetailsBackground,
      borderRadius: 10,
      shadowOffset: {width: 0, height: 1},
      shadowRadius: 2,
      elevation: 2,
      shadowOpacity: 0.4,
    }})