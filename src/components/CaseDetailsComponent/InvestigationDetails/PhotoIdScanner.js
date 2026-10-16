import { StyleSheet, View } from 'react-native';
import { useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import CaptureItemCard from '@components/UI/CaptureItemCard';
import { palette } from '@core/theme';
import { SCREENS, DOC_TYPE, checkLoadingPhoto, checkSuccessPhoto, checkFailurePhoto, faceIds } from '@core/constants';
import * as Speech from 'expo-speech';
import {updatePhotoOrDocumentUploadStatusAction,requestUpdateBeneficiaryPhotoCaseAction} from '@store/ducks/case-submission-slice'
import { useDispatch} from 'react-redux'


// Uploaded images are replaced by a placeholder in redux after upload, so only show real image data
const toImageUri = (base64) => base64 && base64.length > 100 ? `data:image/jpeg;base64,${base64}` : undefined

const PhotoIdScanner = ({selectedClaimId, userId, caseUpdates, sectionFromTemplate}) => {

    const navigation = useNavigation();
    const mandatoryFaceIdListRef = useRef(new Set());
    const dispatch = useDispatch()

    const isEnabled = (faceId) => {
        return faceId?.enabled === undefined ||  faceId?.enabled === true ? true : false  //enabled not defined or true if define otherwise false
      }

    const onClickDigitalId = (sectionName, faceId) => {
        console.log(faceId.reportType + ' Mandatory document list ' + Array.from(mandatoryFaceIdListRef.current))
        if(!isEnabled(faceId)) return
        navigation.navigate(SCREENS.ImageCaptureScreen, {
            docType: DOC_TYPE.PHOTO_ID_SCANNER[0],
            claimId: selectedClaimId,
            email: userId,
            sectionFromTemplate : sectionName,
            investigationName: faceId.reportType,
            isLastMandatory: (mandatoryFaceIdListRef.current.size === 1 && mandatoryFaceIdListRef.current.has(faceId.reportType)) || mandatoryFaceIdListRef.current.size === 0
        })
    } 

    const speechHandler = (faceId) => {
        Speech.speak(faceId.speach ?? faceId.reportName);
      };

    const retryFailedUpload = (sectionName, investigationName) => {
        //console.log(investigationName + ' Retrying - Mandatory document list ' + Array.from(mandatoryFaceIdListRef.current))
        const retryStatusChangePayload = {
            caseId: selectedClaimId,
            section:sectionName,
            documentCategory: faceIds,
            documentName: investigationName
        }
        
        let manualRetryPayload = JSON.parse(JSON.stringify(caseUpdates?.[sectionName]?.[faceIds]?.[investigationName]?.manualRetryPayload || {}));

        // Modify safely without mutating state
        manualRetryPayload.documentDetails = {
            ...manualRetryPayload.documentDetails,
            isLastMandatory: (mandatoryFaceIdListRef.current.size === 1 && mandatoryFaceIdListRef.current.has(investigationName))
             || mandatoryFaceIdListRef.current.size === 0
        };

        dispatch(updatePhotoOrDocumentUploadStatusAction(retryStatusChangePayload))
        dispatch(requestUpdateBeneficiaryPhotoCaseAction(manualRetryPayload))
    } 

      const sectionName = sectionFromTemplate.locationName
      
      let dataCapturePoints = sectionFromTemplate.faceIds.map((faceId, index) => {
        
        const investigationName = faceId?.reportName ?? "test"
        let isPhotoUploaded = isEnabled(faceId) && checkSuccessPhoto(faceId.reportName, sectionName, caseUpdates)
        let isPhotoSubmittedForUpload = isEnabled(faceId) && ( checkSuccessPhoto(faceId.reportName, sectionName, caseUpdates) || checkLoadingPhoto(faceId.reportName, sectionName, caseUpdates))
        let isUploadFailed = isEnabled(faceId) && checkFailurePhoto(faceId.reportName, sectionName, caseUpdates)

        if(faceId.isRequired && !isPhotoSubmittedForUpload) {
            mandatoryFaceIdListRef.current.add(investigationName)   
         } else if(faceId.isRequired && isPhotoSubmittedForUpload)
            mandatoryFaceIdListRef.current.delete(investigationName)   

       //console.log(`${investigationName} Submitted: ${isPhotoSubmittedForUpload} Uploaded: ${isPhotoUploaded} Failed: ${isUploadFailed}`)

        
        let faceMatch = parseInt(caseUpdates?.[sectionName]?.[faceIds]?.[investigationName]?.facePercent ?? "0")

        const status = isPhotoUploaded ? 'success'
            : isUploadFailed ? 'failure'
            : isEnabled(faceId) && checkLoadingPhoto(faceId.reportName, sectionName, caseUpdates) ? 'loading'
            : 'idle'

        return (
            <CaptureItemCard
                key={index}
                title={investigationName}
                required={faceId.isRequired}
                disabled={!isEnabled(faceId)}
                icon={<Ionicons name="camera-outline" size={26} color={palette.accent} />}
                status={status}
                onCapture={() => onClickDigitalId(sectionName, faceId)}
                onSpeak={() => speechHandler(faceId)}
                onRetry={() => retryFailedUpload(sectionName, investigationName)}
                resultImageUri={toImageUri(caseUpdates?.[sectionName]?.[faceIds]?.[investigationName]?.locationImage)}
                resultLabel="Face match"
                resultPass={faceMatch !== 0}
            />
        )

      })


    return (
        <View style={styles.container}>
            {dataCapturePoints}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
})

  export default PhotoIdScanner;
