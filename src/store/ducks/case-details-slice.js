import { createSlice} from "@reduxjs/toolkit"
import {call, put, select} from 'redux-saga/effects';
import {getCaseDetails} from '@services/RestServiceCalls'

import {CASE_DETAILS_OFFLINE_ERROR_MESSAGE} from '@core/constants'

const initialState = {
    casesDetails: {},  // Stores case details for all. This needs to be cleared on Submit
    selectedCaseDetails: {},
    loading: false,
    error: false,
  }
  
  const casesDetailsSlice = createSlice({
    name: "casesDetails",
    initialState,
    reducers:{
      requestCaseDetails: (state) => {        
        state.loading = true;     
        state.error = null        
      },      
      successCaseDetails:  (state, action) => {      
          state.loading = false;            
          state.casesDetails = { ... state.casesDetails, ...action.payload }
          state.selectedCaseDetails = action.payload
      },
      failureCaseDetails: (state, action) => {
        state.loading = false;
        state.error = action.payload
      },
      requestCaseDetailsOffline: (state) => {
        state.selectedCaseDetails= {}, // Clear selected claim
        state.loading = true;     //@Todo Check for offline mode
        state.error = null        
      },
      successCaseDetailsOffline: (state, action) => {
        state.loading = false;     
        state.error = null;
        if ([action.payload.claimId] in (state.casesDetails)) {   // If the claimid is already present in memory
            state.selectedCaseDetails = {[action.payload.claimId]: state.casesDetails[action.payload.claimId]}
        }
           
      },
      failureCaseDetailsOffline: (state) => {
        state.loading = false;    
        state.error = CASE_DETAILS_OFFLINE_ERROR_MESSAGE        
      },

      //@Todo -  Clear details when a case is submitted needs to be implemented

      deleteCaseDetailsAfterSubmission: (state,action) => {

        delete state.casesDetails[action.payload]; 
        state.selectedCaseDetails = {}
      }

    }
  })
  

  function* eventSequenceInConnectedState(action) {
   
    try {              
      //ToDo : Do not fetch if case details available within TTL
        const response = yield call(getCaseDetails,action.payload.userId,action.payload.claimId);   
        let responseUserData = response.data     
        delete responseUserData.investigationData;
        if (responseUserData) {   
          yield put(successCaseDetails({[action.payload.claimId]: {...responseUserData, timestamp : (new Date()).toISOString()} }));          
        } else {
          yield put(failureCaseDetails("Please try again"));
        }
        return;
      } catch (err) {
          yield put(failureCaseDetails(err));
      }
  }

  function* eventSequenceInDisconnectedState(action) {
   try {
        yield put(requestCaseDetailsOffline())
        yield put(successCaseDetailsOffline(action.payload))
        let selectCaseDetails = yield select(state => state.casesDetails.selectedCaseDetails)
        if (Object.keys(selectCaseDetails).length === 0) {
            yield put(failureCaseDetailsOffline());
        }
        return; 
    } catch (err) {
        yield put(failureCaseDetailsOffline());
        }
  }


    export function* asyncRequestCaseDetails(action) {
        let isNetworkConnect = yield select(state => state.network.isConnected)
        if (isNetworkConnect) {
            yield call(eventSequenceInConnectedState,action)
        } else {
            yield call(eventSequenceInDisconnectedState,action)
        } 
        return;
    }
  
    export const { requestCaseDetails,  successCaseDetails,  failureCaseDetails, 
        requestCaseDetailsOffline, successCaseDetailsOffline,  
        failureCaseDetailsOffline, deleteCaseDetailsAfterSubmission} = casesDetailsSlice.actions;
   
  export default casesDetailsSlice.reducer

