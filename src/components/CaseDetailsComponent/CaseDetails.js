import {useState, useEffect} from "react";
import {  useSelector } from 'react-redux';
import { StyleSheet, View, ScrollView, Text, Alert} from 'react-native';

import { requestCaseDetails } from '@store/ducks/case-details-slice'
import CaseDetailsSlider from "./CaseDetailsSlider";
import useNetworkInfo from './../../hooks/useNetworkInfo'


export default function CaseDetails({claimId, userId, investigatable}) {

     
    const caseDetails = useSelector(state => state.casesDetails.selectedCaseDetails)
    const isLoading = useSelector(state => state.casesDetails.loading)
    const error = useSelector(state => state.casesDetails.error)
    const isConnected = useSelector(state => state.network.isConnected);

        return  <LoadingModalWrapper shouldModalBeVisible = {isLoading && caseDetails[claimId] == undefined}> 
                     <CaseDetailsSlider selectedClaim = {caseDetails[claimId]} selectedClaimId = {claimId} userId = {userId} investigatable = {investigatable}/>
                </LoadingModalWrapper>  
   
}

const Styles = StyleSheet.create({

    container : {
   
        marginTop: 50
    },

    scrollView: {
       
        width: '50%',
        margin: 20,
        alignSelf: 'center',        
      },

})

