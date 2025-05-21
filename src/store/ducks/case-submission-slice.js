import {createAction, createSlice} from '@reduxjs/toolkit';
import {call, put, select} from 'redux-saga/effects';
import {updateCaseDocument, updateCaseFace, saveForm, submitCase} from '@services/RestServiceCalls'
import types from '../types';

import { deleteCaseFromListAfterSubmission } from './cases-slice'
import { deleteCaseDetailsAfterSubmission } from './case-details-slice'
import { UPLOAD_TYPE, UPLOAD_SUCCESS_INDICATOR } from '@core/constants';
import * as FileSystem from 'expo-file-system';

function deleteFile(postUpdatePayload) {

  let filePath = postUpdatePayload.OcrImage !== undefined ? postUpdatePayload.OcrImage : postUpdatePayload.locationImage
  FileSystem.getInfoAsync(filePath).then((fileInfo) => {
    if (fileInfo.exists) {
      FileSystem.deleteAsync(filePath)
        .then(() => console.log("File deleted successfully"))
        .catch((error) => console.error("Error deleting file:", error));
    } else {
      console.log("File does not exist");
    }
  }).catch((error) => console.error("Error checking file:", error));
}


/*function mergeDeep(target, source, key = "id") {
  if (!target || typeof target !== "object") target = {};
  if (!source || typeof source !== "object") return target;

  return Object.keys(source).reduce((output, prop) => {
    if (Array.isArray(source[prop])) {
      // Merge arrays of objects based on a unique key
      const mergedArray = [...target[prop] || [], ...source[prop]];
      const map = new Map(mergedArray.map(item => [item[key], item]));
      output[prop] = Array.from(map.values());
    } else if (source[prop] && typeof source[prop] === "object") {
      output[prop] = mergeDeep(target[prop] || {}, source[prop], key);
    } else {
      output[prop] = source[prop];
    }
    return output;
  }, { ...target });
}*/

function mergeDeep(target, source) {
  const output = { ...target };
  
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      output[key] = mergeDeep(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  });

  return output;
}

// ACTIONS
export const requestSaveCaseTemplateAction = createAction(
  types.SAVE_CASE_TEMPLATE,
  function prepare({caseId, caseTemplate, id}) {
    return {
      payload: {
        caseId,
        caseTemplate,    
        id   
      },
      meta: {
        retry: true
      }
    };
  },
);


export const requestUpdateBeneficiaryPhotoCaseAction = createAction(
  types.REQUEST_UPDATE_BENEFICIARY_PHOTO_CASE,
  function prepare({caseId, section, documentCategory, documentName, documentDetails, id}) {
    return {
      payload: {
        caseId,
        section,
        documentCategory,
        documentName,
        documentDetails,    
        id   
      },
      meta: {
        retry: true
      }
    };
  },
);

export const requestUpdatePanCaseAction = createAction(
  types.REQUEST_UPDATE_PAN_CASE,
  function prepare({caseId, section, documentCategory, documentName, documentDetails, id}) {
    return {
      payload: {
        caseId,
        section,
        documentCategory,
        documentName,
        documentDetails,    
        id   
      },
      meta: {
        retry: true
      }
    };
  },
);


export const requestSaveFormAction = createAction(
  types.REQUEST_SAVE_FORM,
  function prepare({caseId, section, documentCategory, documentDetails, id}) {
    return {
      payload: {
        caseId,
        section, 
        documentCategory, 
        documentDetails,    
        id    
      },
      meta: {
        retry: true
      }
    };
  },
);


export const requestSubmitCaseAction = createAction(
  types.REQUEST_SUBMIT_CASE,
  function prepare({claimId, email, beneficiaryId, Remarks, Question1, Question2, Question3, Question4 }) {
    return {
      payload: {
        claimId, 
        email,
        beneficiaryId,
        Remarks ,
        Question1,
        Question2,
        Question3,
        Question4  
      },
    };
  },
);

/*
how caseUpdates would be stored
{"casesUpdates":
	{"claimId1":
		[{"verifier_address~agent_photo": {              
					  email":"agent@verify.com",
					  "claimId":"claimId1",
					  "Remarks":null,
					  "docType":"PHOTO",
					  "capability":"Single FaceReader",
					  "type":1,
					  "LocationLongLat":"-37.8263221 / 145.2236966",
					  "locationImage":"/9j/4AAQSkZJRgABAQEASABIAAD/4QKpRXhpZgAASUkqAAgAAAAMAAA"
					  }
		
}]
	}
}
*/

const initialState = {
    casesUpdates: {},  // Stores case details for all. This needs to be cleared on Submit    
    loading: false,
    error: false,
  }

  const casesUpdateSlice = createSlice({
    name: "casesUpdates",
    initialState,
    reducers:{ 
          saveCaseTemplate : (state, action) => {                  
            console.log('saving template in redux')
            const caseId = action.payload.caseId   
            const caseTemplate = action.payload.caseTemplate              
            state.casesUpdates[caseId] = caseTemplate
            console.log(JSON.stringify(state.casesUpdates))
          },      
          requestUpdateBeneficiaryPhotoCase: (state) => {                  
            state.loading = true;     
            state.error = null        
          },      
          requestUpdatePanCase: (state) => {                  
            state.loading = true;     
            state.error = null        
          },

          requestSaveForm : (state,action) => {
                           
            console.log('requestSaveForm called')
            state.loading = true;     
            state.error = null   
          },

          successUpdateCase:  (state, action) => {     
              
              state.loading = false;   
              state.casesUpdates = mergeDeep(state.casesUpdates, action.payload)   
              //console.log('SUCCESS--------------------------------------------------')
              //console.log(JSON.stringify(action))
              //console.log(JSON.stringify(state.casesUpdates))
          },
          failureUpdateCase: (state, action) => {
            state.loading = false;
            state.error = action.payload
          },

          requestSubmitCase :  (state) => {        
            state.loading = true;     
            state.error = null        
          },      
          successDeleteCaseUpdateDetailsAfterSubmission: (state,action) => {
            if (action.payload in state.casesUpdates)
              delete state.casesUpdates[action.payload]; 

            state.loading = false;     
            state.error = null 
          },
          failureSubmitCase : (state,action) => {
            state.loading = false;     
            state.error = action.error 
          },

    }
  })



  export function* asyncPostCaseDocuments(action) {
   //console.log('ACTION asyncPostCaseDocuments------>' + JSON.stringify(action))
    try {              
      //ToDo : Do not fetch if case details available within TTL
      //documentDetails : {PAN : {}}
      //As soon as the image is clicked - show that image is submited. 
      if(action.payload.documentDetails.docType === UPLOAD_TYPE.PHOTO || action.payload.documentDetails.docType === UPLOAD_TYPE.DOCUMENT)
      {
        let successPayload = {
          [action.payload.caseId] : {
            [action.payload.section] : {
              [action.payload.documentCategory] : {
                [action.payload.documentName] : {
                  ...action.payload.documentDetails, 
                  locationImage: '',
                  OcrImage: '',
                  id: action.payload.id
                } 
              }
            }
          }       
        }
        yield put(successUpdateCase(successPayload));
      }      
          

        let readText = null
        //if(action.payload.documentDetails.docType ===  UPLOAD_TYPE.DOCUMENT)
        //  readText = yield call(callGoogleVisionAsync,action.payload.documentDetails.OcrImage)

        let postUpdatePayload = action.payload.documentDetails
        //postUpdatePayload.OcrData = readText?.text
        console.log('triggering upload')
        let response = ''
        if (action.payload.documentDetails.docType ===  UPLOAD_TYPE.DOCUMENT)
          response = yield call(updateCaseDocument,postUpdatePayload);    
        else if (action.payload.documentDetails.docType ===  UPLOAD_TYPE.PHOTO)
          response = yield call(updateCaseFace,postUpdatePayload);  
        else if (action.payload.documentDetails.docType ===  UPLOAD_TYPE.FORM)
          response = yield call(saveForm,postUpdatePayload);    
        const responseUserData = response.data        
        //console.log("received claim details" + JSON.stringify(responseUserData))
        
        //ToDo :  Handle when there is error calling the one of the 2 APIs
        if (responseUserData) {     

          let successPayload = undefined
          if(action.payload.documentDetails.docType === UPLOAD_TYPE.PHOTO) {

            successPayload = {
              [action.payload.caseId] : {
                [action.payload.section] : {
                  [action.payload.documentCategory] : {
                    [action.payload.documentName] : {
                      ...action.payload.documentDetails, 
                      id: action.payload.id,
                      locationImage:  responseUserData.locationImage,                  
                      facePercent: responseUserData.facePercent                      
                    } 
                  }
                }
              }        
            } 

          } else if (action.payload.documentDetails.docType === UPLOAD_TYPE.DOCUMENT) {
            successPayload = {
              [action.payload.caseId] : {
                [action.payload.section] : {
                  [action.payload.documentCategory] : {
                    [action.payload.documentName] : {
                      ...action.payload.documentDetails, 
                      id: action.payload.id,
                      OcrImage: responseUserData.ocrImage,                    
                      panValid: responseUserData.panValid                      
                    } 
                  }
                }
              }        
            }
          } else if (action.payload.documentDetails.docType === UPLOAD_TYPE.FORM) {
            console.log(`Creating payload for form`)
            const caseNo = action.payload.caseId
            const section = action.payload.section
            const category = action.payload.documentCategory
            successPayload = {
              [caseNo] : {
                [section] : {
                  [category] : action.payload.documentDetails.qna.reduce((acc, item) => {
                    acc[item.questionText] = item;
                    return acc;
                  }, {})
                  
                }
              }        
            }
          }
                  
            
          yield put(successUpdateCase(successPayload)); 
          if(action.payload.documentDetails.docType === UPLOAD_TYPE.PHOTO || action.payload.documentDetails.docType === UPLOAD_TYPE.DOCUMENT)
            yield call(deleteFile,postUpdatePayload)
        } else {    // TODO  :  retry on error
          yield put(failureUpdateCase());
        }
        return;
      } catch (err) {
          console.log(err);
          yield put(failureUpdateCase(err));
      }
  }

  export function* asyncSubmitCaseDocuments(action) {
    try {              
      //ToDo : Do not fetch if case details available within TTL
      //documentDetails : {PAN : {}}
        const response = yield call(submitCase,action.payload);    
        const responseUserData = response.data        
        if (responseUserData) {   
          yield put(deleteCaseFromListAfterSubmission(action.payload.claimId))
          yield put(successDeleteCaseUpdateDetailsAfterSubmission(action.payload.claimId));   
          yield put(deleteCaseDetailsAfterSubmission(action.payload.claimId)) 
        } else {
          yield put(failureSubmitCase());
        }
        return;
      } catch (err) {
          console.log(err);
          yield put(failureSubmitCase(err));
      }
  }

  export function* asyncOfflineUpdateOrSubmitCase(action) {

    console.log('Update in offline mode')
    try {                    
        const {prevAction} = action.payload;
        if ( action.payload.prevAction.type === types.REQUEST_UPDATE_BENEFICIARY_PHOTO_CASE  || 
           action.payload.prevAction.type === types.REQUEST_UPDATE_PAN_CASE) {
          let successPayload = {
            [prevAction.payload.claimId] : {...prevAction.payload.documentDetails, locationImage: "", OcrImage: "",  id: prevAction.payload.id }
          }
          yield put(successUpdateCase(successPayload));    
        }      
        return;
      } catch (err) {
          console.log(err);
          yield put(failureSubmitCase(err));
      }
  }



  export const { saveCaseTemplate,  successUpdateCase,  failureUpdateCase,  
    successDeleteCaseUpdateDetailsAfterSubmission, failureSubmitCase} = casesUpdateSlice.actions;

export default casesUpdateSlice.reducer