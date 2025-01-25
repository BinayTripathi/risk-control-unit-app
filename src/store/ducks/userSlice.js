import { createSlice } from "@reduxjs/toolkit"

import {call, put} from 'redux-saga/effects';

import {userLogin, userRegister} from '@services/RestServiceCalls'
import {reset} from '@services/NavigationService';
import { SECURE_USER_KEY, SECURE_USER_PIN, LOGIN_ERROR_MESSAGE, REGISTRATION_ERROR_MESSAGE } from '@core/constants'
import { SCREENS } from '@core/constants';
import {secureSave, secureGet} from '@helpers/SecureStore'

const initialState = {
    data: {},
    error: null,
    loading: false,
    userId: null,
    auth: null,
    lastLogin: null,
    isLoggedIn : false
  };



  /*
export const requestValidateUser = createAction(TYPES.REQUEST_VALIDATE_USER);
export const successValidateUser = createAction(TYPES.SUCCESS_VALIDATE_USER);
export const failureValidateUser = createAction(TYPES.FAILURE_VALIDATE_USER);
export const logoutUser = createAction(TYPES.LOGOUT_USER);


  const validateUserReducers = {
    [TYPES.REQUEST_VALIDATE_USER]: (state) => {
      state.loading = true;      
    },
    [TYPES.SUCCESS_VALIDATE_USER]: (state, action) => {
      state.loading = false;
      state.userid = action.payload.emailId,
      state.auth = action.payload.pwd
      state.isLoggedIn = true
      state.lastLogin = (new Date()).getTime() / 1000
      state.data = {'claim': action.payload.data} ;
      
    },
    [TYPES.FAILURE_VALIDATE_USER]: (state) => {
      state.loading = false;
      state.data = {};
      state.userid = null,
      state.auth = null,
      state.isLoggedIn = false
    },
  };
  
  const logoutUserReducers = {
    [TYPES.LOGOUT_USER]: (state) => {     
        state.isLoggedIn = false
    },
  };

  export default createReducer(INITIAL_STATE, {
    ...validateUserReducers,
    ...logoutUserReducers,
  });*/

  const userSlice = createSlice({
    name: "user",
    initialState :  {      
        //data: {},
        error: null,
        loading: false,
        userId: null,
        auth: null,
        lastLogin: null,
        isLoggedIn : false,
        isRegistered : 0, 
        deviceId : null     
    },
    reducers:{

          requestRegisterUser: (state) => {
            state.loading = true;     
            state.error = null        
          },
          
          successRegisterUser: (state, action) => { 
            console.log(action.payload)        
            state.loading = false;
            state.isRegistered= action.payload.step      
            state.userId = action.payload.email,
            state.auth = action.payload.pin
            state.deviceId = action.payload.deviceId
          },

          failureRegisterUser: (state) => {
            state.loading = false;                        
            state.error = REGISTRATION_ERROR_MESSAGE
          },

          requestValidateUser: (state) => {
              state.loading = true;     
              state.error = null        
          },
          requestValidateUserAuto:  (state) => {
            state.loading = true;  
            state.error = null   
          },
          successValidateUser: (state, action) => {            
            state.loading = false;
            //state.userId = action.payload.emailId,
            state.auth = action.payload.password
            state.isLoggedIn = true
            state.lastLogin =  (new Date()).toISOString()
            //state.data = {'claim': action.payload.data} ;            
          },

          failureValidateUser: (state) => {
            //state.data = {};
            state.loading = false;            
            state.userId = null,
            state.auth = null,
            state.isLoggedIn = false
            state.error = LOGIN_ERROR_MESSAGE
          },
                
          navigateFromHomePage :  (state) => {
            console.log('navigate from home page')
            state.loading = false; 
            state.error = null      
          },

          logoutUser: (state) => {     
            state.data = {};
            state.error = null,
            state.loading = false,            
            isLoggedIn = false,
            state.isLoggedIn = false
            state.lastLogin =  null
        }
    }
  })

  export function* asyncRequestRegisterUser(action) {
    try {      
      if(action.payload.step === 1) {
        const response = yield call(userRegister, action.payload.phoneNo, action.payload.deviceId);
        //const responseUserData = response.data?.token;     
        const responseUserData = response.data
        if (responseUserData) {          
          yield put(successRegisterUser({"deviceId":action.payload.deviceId, "step": action.payload.step, ...responseUserData}));
          return
          //return reset({routes: [{name: SCREENS.Login}]});
        }  
        console.log('REGISTRATION FAILED')
        yield put(failureRegisterUser());
      } else {
        yield put(successRegisterUser({"step": action.payload.step}))
      }
    } catch (err) {
      console.log(err)
      yield put(failureRegisterUser());
    }
  }

  export function* asyncRequestValidateUser(action) {
    try {      
        const response = yield call(userLogin, action.payload.emailId);
        //const responseUserData = response.data?.token;     
        const responseUserData = response.data
        if (responseUserData) {          
          yield put(successValidateUser({...action.payload, data: responseUserData }));
          return reset({routes: [{name: SCREENS.CaseList}]});
        }      
      yield put(failureValidateUser());
    } catch (err) {
      console.log(err);
      yield put(failureValidateUser());
    }
  }

  export function* asyncRequestValidateUserAutologin(action) {  
    yield put(successValidateUser({...action.payload}))
    return   
  }

  export const { requestRegisterUser, successRegisterUser, failureRegisterUser, 
    requestValidateUser, requestValidateUserAuto, successValidateUser, 
    failureValidateUser, navigateFromHomePage, logoutUser } = userSlice.actions;
  export default userSlice.reducer