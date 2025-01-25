import {all, fork, takeLatest, takeEvery} from 'redux-saga/effects';
import {networkSaga} from 'react-native-offline';
import TYPES from './types';
import {offlineActionTypes} from 'react-native-offline';

import {asyncRequestRegisterUser, asyncRequestValidateUser, asyncRequestValidateUserAutologin} from './ducks/userSlice';
import { asyncRequestAllCases, requestAllCasesOffline, asyncRequestAllCaseCoordinates } from './ducks/cases-slice';
import { asyncRequestCaseDetails} from './ducks/case-details-slice'
import { asyncPostCaseDocuments, asyncSubmitCaseDocuments,
  asyncOfflineUpdateOrSubmitCase } from './ducks/case-submission-slice'


export default function* root() {
  yield all([
    takeLatest("user/requestRegisterUser", asyncRequestRegisterUser),
    takeLatest("user/requestValidateUser", asyncRequestValidateUser),
    takeLatest("user/requestValidateUserAuto", asyncRequestValidateUserAutologin),
    takeLatest("cases/requestCases", asyncRequestAllCases),
    takeLatest("cases/requestCasesOffline", requestAllCasesOffline),
    takeLatest("cases/requestCasesCoordinates", asyncRequestAllCaseCoordinates),
    takeLatest("casesDetails/requestCaseDetails", asyncRequestCaseDetails),
    takeLatest(TYPES.REQUEST_UPDATE_BENEFICIARY_PHOTO_CASE, asyncPostCaseDocuments),
    takeLatest(TYPES.REQUEST_UPDATE_PAN_CASE, asyncPostCaseDocuments),
    takeLatest(TYPES.REQUEST_SUBMIT_CASE, asyncSubmitCaseDocuments),
    takeEvery(offlineActionTypes.FETCH_OFFLINE_MODE, asyncOfflineUpdateOrSubmitCase),
    fork(networkSaga, {pingServerUrl:'https://www.google.com/'}),
  ]);
}