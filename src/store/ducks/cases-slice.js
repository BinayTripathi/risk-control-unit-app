import { createSlice} from "@reduxjs/toolkit"
import {call, put} from 'redux-saga/effects';

import {getAllCases, getAllCaseCoordinates} from '@services/RestServiceCalls'




const initialState = {
  cases: [],
  caseCoordinates: [],
  loading: false,
  error: false,
}

const casesSlice = createSlice({
  name: "cases",
  initialState,
  reducers:{
    requestCases: (state) => {
      
      state.loading = true;     
      state.error = null        
    },
    requestCasesOffline: (state) => {
      state.loading = true;     
      state.error = null        
    },
    successCases:  (state, action) => {      
        state.loading = false;  
        state.cases= action.payload?.cases
    },
    requestCasesCoordinates: (state) => {      
      state.loading = true;     
      state.error = null        
    },
    successCasesCoordinates:  (state, action) => {      
      state.loading = false;  
      state.caseCoordinates= action.payload?.casesCoordinates   
  },
    failureCases: (state, action) => {
      state.loading = false;
      state.error = action.payload
    },
    deleteCaseFromListAfterSubmission: (state,action) => {

      state.cases.filter((eachClaim, index) => {
        
        if (action.payload === eachClaim.claimId) {
          // Removes the value from the original array
              state.cases.splice(index, 1);
              return true;
          }
          return false;
      })
    }
  }
})



export function* asyncRequestAllCases(action) {

  try {      
      const response = yield call(getAllCases,action.payload);      
      const responseUserData = response.data          
      if (responseUserData) {          
        yield put(successCases({...action.payload, cases: responseUserData }));          
      } else {
        yield put(failureCases("Please try again"));
      }
      return;
  } catch (err) {
    console.log(err);
    yield put(failureCases(err));
  }
}

export function* requestAllCasesOffline(action) {  
  yield put(successCases({...action.payload}))
  return; 
}

export function* asyncRequestAllCaseCoordinates(action) {

  try {      
      const response = yield call(getAllCaseCoordinates,action.payload);      
      const responseUserData = response.data          
      if (responseUserData) {          
        yield put(successCasesCoordinates({casesCoordinates: responseUserData }));          
      } else {
        yield put(failureCases("Please try again"));
      }
      return;
  } catch (err) {
    console.log(err);
    yield put(failureCases(err));
  }
}

  export const { requestCases, requestCasesOffline, requestCasesCoordinates, successCasesCoordinates, successCases, 
    failureCases, deleteCaseFromListAfterSubmission} = casesSlice.actions;
 
export default casesSlice.reducer