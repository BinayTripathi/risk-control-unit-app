import { configureStore, combineReducers, getDefaultMiddleware } from '@reduxjs/toolkit';
import { reducer as network, createNetworkMiddleware  } from 'react-native-offline';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createExpoFileSystemStorage } from 'redux-persist-expo-file-system-storage';
import { documentDirectory } from 'expo-file-system';
//import createEncryptor from 'redux-persist-transform-encrypt';
//import RNFS from 'react-native-fs';

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import rootSagas from './sagasRoot';
import userReducer from './ducks/userSlice'
import casesReducer from './ducks/cases-slice'
import selectedCaseReducer from './ducks/case-slice';
import caseDetailsSliceReducer from './ducks/case-details-slice';
import casesUpdatesSliceReducer from './ducks/case-submission-slice'


const sagaMiddleware = createSagaMiddleware();

const networkMiddleware = createNetworkMiddleware({
    queueReleaseThrottle: 200,
    regexActionType: /.*requestUpdate.*Case/,
  });

  const fileSystemStorage = createExpoFileSystemStorage({
    storagePath: `${documentDirectory}reduxStore/`,
    //storagePath: `${RNFS.ExternalStorageDirectoryPath}/Download/`,
    encoding: 'utf8',
  });
  

  /*const encryptor = createEncryptor({
    secretKey: 'your-super-secret-key',
  });*/


const persistConfig = {
    key: 'root',
    version: 1,
    storage: fileSystemStorage,
    //transforms: [encryptor],
  };

  const appReducer = combineReducers({
    user: userReducer,
    cases: casesReducer,
    selectedCase : selectedCaseReducer,
    casesDetails: caseDetailsSliceReducer,
    casesUpdates: casesUpdatesSliceReducer,
    network
  });

  const rootReducer = (state, action) => {   
    // Clear all data in redux store to initial.
    if(action.type === "DESTROY_SESSION") {
        console.log('BOOM')
        state = undefined;
    }       
    
    return appReducer(state, action);
 };
  
  //const persistedReducer = persistReducer(persistConfig, reducer);
  const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
        .concat(networkMiddleware)
        .concat(sagaMiddleware)
  
  /*[networkMiddleware, sagaMiddleware,
    ...getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),]*/
  })
  sagaMiddleware.run(rootSagas);

  const persistor = persistStore(store);

  export {persistor};

  export default store;