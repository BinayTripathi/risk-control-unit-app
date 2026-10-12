import { StyleSheet, View, Image } from 'react-native';
import { useRef } from 'react';
import CaptureItemCard from '@components/UI/CaptureItemCard';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import { SCREENS, DOC_TYPE, checkLoadingDoc, checkSuccessDoc, checkFailureDoc, documentIds } from '@core/constants';
import * as Speech from 'expo-speech';
import {updatePhotoOrDocumentUploadStatusAction, requestUpdatePanCaseAction} from '@store/ducks/case-submission-slice'
import { useDispatch} from 'react-redux'


// Uploaded images are replaced by a placeholder in redux after upload, so only show real image data
const toImageUri = (base64) => base64 && base64.length > 100 ? `data:image/jpeg;base64,${base64}` : undefined

const DocumentScanner = ({selectedClaimId, userId, caseUpdates, sectionFromTemplate}) => {

  const navigation = useNavigation();
  const mandatoryDocumentListRef = useRef(new Set());
  const dispatch = useDispatch()


  const isEnabled = (investigationDoc) => {
    return investigationDoc?.enabled === undefined ||  investigationDoc?.enabled === true ? true : false
  }

  const onClickDigitalId = (sectionName,documentObj, documentScannerType) => {
    console.log('Mandatory document list' + Array.from(mandatoryDocumentListRef.current))
    if(!isEnabled(documentObj)) return
    navigation.navigate(SCREENS.ImageCaptureScreen, {
        docType: documentScannerType,
        claimId: selectedClaimId,
        email: userId,
        sectionFromTemplate : sectionName,
        investigationName: documentObj.reportType,
        isLastMandatory: (mandatoryDocumentListRef.current.size === 1 && mandatoryDocumentListRef.current.has(documentObj.reportType)) || mandatoryDocumentListRef.current.size === 0
      })
}

const speechHandler = (documentObj) => {
  Speech.speak(documentObj.speach ?? documentObj.reportName);
};

   const retryFailedUpload = (sectionName, investigationName) => {
        //console.log('Retrying - Mandatory document list' + Array.from(mandatoryDocumentListRef.current))
        const retryStatusChangePayload = {
            caseId: selectedClaimId,
            section:sectionName,
            documentCategory: documentIds,
            documentName: investigationName
        }
        
        let manualRetryPayload = JSON.parse(JSON.stringify(caseUpdates?.[sectionName]?.[documentIds]?.[investigationName]?.manualRetryPayload || {}));

        // Modify safely without mutating state
        manualRetryPayload.documentDetails = {
            ...manualRetryPayload.documentDetails,
            isLastMandatory: (mandatoryDocumentListRef.current.size === 1 && mandatoryDocumentListRef.current.has(investigationName))
             || mandatoryDocumentListRef.current.size === 0
        };
        //console.log(`RETRYING : ${JSON.stringify(manualRetryPayload)}`)
        dispatch(updatePhotoOrDocumentUploadStatusAction(retryStatusChangePayload))
        dispatch(requestUpdatePanCaseAction(manualRetryPayload))
    } 

const sectionName = sectionFromTemplate.locationName

let dataCapturePoints = sectionFromTemplate.documentIds.map((investigationDocument, index)=> {  

  const investigationName = investigationDocument?.reportName ?? "test"

  const documentScannerType = DOC_TYPE.DOCUMENT_SCANNER.find(docScanner => docScanner.name === investigationName)  ??  DOC_TYPE.DOCUMENT_SCANNER.at(-1)
  const captureIcon = documentScannerType.icon

  let panValid = caseUpdates?.[sectionName]?.[documentIds]?.[investigationName]?.valid ?? true

  let isDocumentUploaded = isEnabled(investigationDocument) === true && checkSuccessDoc(investigationName, sectionName, caseUpdates)

  let isDocumentSubmitted = isEnabled(investigationDocument) === true && (checkSuccessDoc(investigationName, sectionName, caseUpdates) || checkLoadingDoc(investigationName, sectionName, caseUpdates))

  let isDocumetSubmitFailed = isEnabled(investigationDocument) && checkFailureDoc(investigationName, sectionName, caseUpdates) 

  //console.log(`${investigationName} Submitted: ${isDocumentSubmitted} Uploaded: ${isDocumentUploaded} Failed: ${isDocumetSubmitFailed}`)

  if(investigationDocument.isRequired && !isDocumentSubmitted) { // Not loading or not successful, means not sent or possiblely failed
    mandatoryDocumentListRef.current.add(investigationName)   
  } else if(investigationDocument.isRequired && isDocumentSubmitted) //Either submited(loadin or success) - if failure happens - its gets added back
    mandatoryDocumentListRef.current.delete(investigationName)  
 

  const status = isDocumentUploaded ? 'success'
    : isDocumetSubmitFailed ? 'failure'
    : isEnabled(investigationDocument) && checkLoadingDoc(investigationName, sectionName, caseUpdates) ? 'loading'
    : 'idle'

      return(
          <CaptureItemCard
              key={index}
              title={investigationName.replace(/_/g, ' ')}
              required={investigationDocument.isRequired}
              disabled={!isEnabled(investigationDocument)}
              icon={captureIcon
                ? <Image source={{uri:`${captureIcon}`}} style={styles.iconImage} />
                : <Ionicons name="document-text-outline" size={26} color={palette.accent} />}
              status={status}
              onCapture={() => onClickDigitalId(sectionName, investigationDocument, documentScannerType)}
              onSpeak={() => speechHandler(investigationDocument)}
              onRetry={() => retryFailedUpload(sectionName, investigationName)}
              resultImageUri={toImageUri(caseUpdates?.[sectionName]?.[documentIds]?.[investigationName]?.OcrImage)}
              resultLabel="Document check"
              resultPass={panValid !== false}
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
  iconImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
})

export default DocumentScanner;
