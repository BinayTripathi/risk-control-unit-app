import { createSlice} from "@reduxjs/toolkit"
import {call, put, select} from 'redux-saga/effects';
import {getCaseDetails, getCaseTemplate} from '@services/RestServiceCalls'

import {CASE_DETAILS_OFFLINE_ERROR_MESSAGE} from '@core/constants'
import {getDefaultCaseTemplate} from '@core/defaultCaseTemplates'

const initialState = {
    casesDetails: {},  // Stores case details for all. This needs to be cleared on Submit
    selectedCaseDetails: {},
    caseTemplates: {},  // Investigation template per case, fetched once on first load. Cleared on Submit

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
          /*let casesIdsTillNow = Object.keys(state.casesDetails)  
          console.log(`All Keys ${casesIdsTillNow}`)
          if (casesIdsTillNow.length > 2) {
            const firstKey = casesIdsTillNow[0]; // Get the first key
            console.log(`purging key ${firstKey}`)
            delete state.casesDetails[firstKey]; // Remove the first key
          }*/

          state.casesDetails = { ... state.casesDetails, ...action.payload }
          state.selectedCaseDetails = action.payload
      },
      failureCaseDetails: (state, action) => {
        state.loading = false;
        state.error = action.payload
      },
      saveCaseTemplateDefinition: (state, action) => {
        // caseTemplates may be missing in state persisted by older app versions
        state.caseTemplates = { ...(state.caseTemplates || {}), [action.payload.claimId]: action.payload.template }
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
        if (state.caseTemplates) delete state.caseTemplates[action.payload];
        state.selectedCaseDetails = {}
      }

    }
  })
  

  // Fetch the investigation template only the first time a case is loaded on this device.
  // Afterwards it is served from redux (persisted), so the case keeps a stable template.
  function* fetchCaseTemplateIfMissing(userId, claimId, claimType) {
    const storedTemplate = yield select(state => state.casesDetails.caseTemplates?.[claimId])
    if (storedTemplate) return

    // Case already in progress with the bundled template (before server templates existed):
    // keep using it so it matches the progress already captured in casesUpdates.
    const caseUpdates = yield select(state => state.casesUpdates.casesUpdates?.[claimId])
    let template = caseUpdates ? getDefaultCaseTemplate(claimType) : null

    if (!template) {
      try {
        const response = yield call(getCaseTemplate, userId, claimId)
        if (Array.isArray(response?.data) && response.data.length > 0)
          template = response.data
      } catch (err) {
        console.log(`Failed to fetch template for case ${claimId}: ${err}`)
      }
    }

    if (!template) {
      console.log(`Using bundled template for case ${claimId}`)
      template = getDefaultCaseTemplate(claimType)
    }
    yield put(saveCaseTemplateDefinition({claimId, template}))
  }

  function* eventSequenceInConnectedState(action) {

    try {
      //ToDo : Do not fetch if case details available within TTL
        const response = yield call(getCaseDetails,action.payload.userId,action.payload.claimId);
        let responseUserData = response.data
        delete responseUserData.investigationData;
        if (responseUserData) {
          // Template must be in place before details render, as the slider builds casesUpdates from it once
          yield call(fetchCaseTemplateIfMissing, action.payload.userId, action.payload.claimId, responseUserData.policy?.claimType)
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
  
    export const { requestCaseDetails,  successCaseDetails,  failureCaseDetails, saveCaseTemplateDefinition,
        requestCaseDetailsOffline, successCaseDetailsOffline,  
        failureCaseDetailsOffline, deleteCaseDetailsAfterSubmission} = casesDetailsSlice.actions;
   
  export default casesDetailsSlice.reducer

