import React, {  useEffect, useRef, useState  } from "react";
import { StyleSheet,Text,TouchableOpacity, View, Image, Alert, Dimensions, ScrollView} from "react-native";
import { useDispatch} from 'react-redux'
import { useNavigation } from "@react-navigation/native";
import { PaperProvider } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import DocumentScanner from 'react-native-document-scanner-plugin'

import {userRegisterPhoto} from '@services/RestServiceCalls'
import useApi from '@hooks/useApi'
import UserTracker from "./UserTracker";
import {requestRegisterUser} from '@store/ducks/userSlice'

import {theme, palette, radius, spacing} from '../../core/theme'
import { Ionicons } from '@expo/vector-icons';
import { UPLOAD_TYPE, SECURE_REGISTRATION_COMPLETE, PAGE_COUNT } from '@core/constants';
import {secureSave} from '@helpers/SecureStore'

import {requestUpdateBeneficiaryPhotoCaseAction, requestUpdatePanCaseAction} from '@store/ducks/case-submission-slice'
import useLocationTracker from "@hooks/useLocationTracker";
import LoadingModalWrapper from '@components/UI/LoadingModal';

import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import OkayCancelDialogBox from "@components/UI/OkayCancelDialogBox";


let imageRatio = 1
//https://www.farhansayshi.com/post/how-to-save-files-to-a-device-folder-using-expo-and-react-native/
const ImagePreview = ({photoData, setPhotoData ,claimId, docType, email, sectionName,
  investigationName, isLastMandatory, pageCount}) => {

    // Documents arrive as an array of page uris; photos as a single uri
    const pages = Array.isArray(photoData) ? photoData : [photoData]

    const navigation = useNavigation();
    let savedPhoto = useRef(null);
    const [displayMap, setDisplayMap] = useState(false);
    const dispatch = useDispatch()
    const tracker = useLocationTracker()
    const { triggerApi, data, error, loading } = useApi(userRegisterPhoto, photoData);
    //const {widthPic, heightPic} = Image.resolveAssetSource(photoData);
    //console.log(`${widthPic} , ${heightPic}`)

    const [showSaveDialog, setShowSaveDialog] = useState(false)
    const [savePayload, setSavePayload] = useState(null)

    useEffect(() => {
      if (data !== null) {
        
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Welcome Onboard',
          textBody: 'Continue to login...',
          button: 'OK',          
          onHide: async () => {
            // Save photo to device
            try {
              let base64Data;
              if (photoData.startsWith('data:')) {
                base64Data = photoData.replace(/^data:image\/[a-z]+;base64,/, '');
              } else if (photoData.startsWith('file://')) {
                base64Data = await FileSystem.readAsStringAsync(photoData, { encoding: FileSystem.EncodingType.Base64 });
              } else {
                throw new Error('Unsupported photo data format');
              }
              const filePath = FileSystem.documentDirectory + 'profile.jpg';
              await FileSystem.writeAsStringAsync(filePath, base64Data, { encoding: FileSystem.EncodingType.Base64 });
              console.log('Photo saved to:', filePath);
            } catch (error) {
              console.error('Error saving photo:', error);
            }
            // Then proceed
            const dataToSendForReg = {
              step: 3
            }
            dispatch(requestRegisterUser(dataToSendForReg))
            navigation.navigate('Login')
          } 
        })   
        
      }              
  
      if (error !== null)      {
        secureSave(SECURE_REGISTRATION_COMPLETE,"true")
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: 'Failed to save photo',
          textBody: 'Please try again',
          button: 'Close'
        })   
        
      } 
    }, [data, error])
  
     
    //Image.getSize(`data:image/png;base64,${photoData}`, (width, height) => {imageRatio = width/ width});
    Image.getSize(`${pages[0]}`, (width, height) => {imageRatio = width/ width});
    
    const savePhoto = async () => {        

      const documentDetailsForSubmission = {
        email : email,
        caseId: claimId,            
        Remarks:null,
        docType: docType.type,
        capability: docType.name,
        sectionName,
        investigationName,
        isLastMandatory
      }
      
      if(docType.type === UPLOAD_TYPE.PHOTO){
        documentDetailsForSubmission.LocationLongLat = tracker
        documentDetailsForSubmission.locationImage = photoData
      } else {
        documentDetailsForSubmission.OcrLongLat = tracker
        documentDetailsForSubmission.OcrImages = pages
      }
      
      const payloadToSave = {
        caseId: claimId,
        section : documentDetailsForSubmission.sectionName,
        documentCategory: docType.type === UPLOAD_TYPE.PHOTO ? 'faceIds' : 'documentIds',
        documentName: documentDetailsForSubmission.investigationName,
        documentDetails :  documentDetailsForSubmission,
        id: Math.floor(1000 + Math.random() * 9000) * -1
      }
      setSavePayload(payloadToSave)
      setShowSaveDialog(true)
    }   

    const isDocument = docType.type === UPLOAD_TYPE.DOCUMENT
    const isMissingBack = pageCount === PAGE_COUNT.FRONT_BACK && pages.length < 2
    const canAddPage = isMissingBack || pageCount === PAGE_COUNT.MULTIPLE

    const scanOnePage = async () =>
      (await DocumentScanner.scanDocument({ croppedImageQuality: 100, maxNumDocuments: 1 })).scannedImages?.[0]

    // Replaces one page in place so the rest of a long document does not need rescanning
    const retakePage = async (index) => {
      const page = await scanOnePage()
      if (page) setPhotoData(pages.map((uri, pageIndex) => pageIndex === index ? page : uri))
    }

    const addPage = async () => {
      const page = await scanOnePage()
      if (page) setPhotoData([...pages, page])
    }

    const displayMapHandler = () => {
      setDisplayMap((displayMap) => !displayMap)     
    }
    

    const displayMapModal = displayMap ?                             
                              <UserTracker photoData={photoData} displayMapHandler={displayMapHandler} shouldDisplayMap = {displayMap}/>
                             : ( <>
                                 <UserTracker photoData={false}/>
                                 <ScrollView horizontal pagingEnabled>
                                   {pages.map((uri, index) => (
                                     <View key={uri} style={styles.page}>
                                       <Image source={{uri}} style={styles.middlePhoto} accessibilityLabel={getPageLabel(index, pages.length)} />
                                       {isDocument &&
                                         <View style={styles.pageFooter}>
                                           <Text style={styles.pageLabel}>{getPageLabel(index, pages.length)}</Text>
                                           {pages.length > 1 &&
                                             <TouchableOpacity style={styles.pageRetakeBtn} onPress={() => retakePage(index)}
                                               accessibilityLabel={`Retake ${getPageLabel(index, pages.length)}`}>
                                               <Ionicons name="camera-outline" size={18} color={palette.onCamera} />
                                               <Text style={styles.prevBtnText}>Retake this page</Text>
                                             </TouchableOpacity>}
                                         </View>}
                                     </View>
                                   ))}
                                 </ScrollView>
                                   </> )

  const saveImageAlertBox = <OkayCancelDialogBox showDialog={showSaveDialog} 
                                                setShowDialog={setShowSaveDialog}
                                                title={'Save Item'} 
                                                content={(`Do you want to save ${investigationName ?? docType.name}`)}
                                                okayHandler={ async () => {      
                                                    if (claimId !== "AGENT_ONBOARDING")   {
                                                      if(docType.type === 'PHOTO')
                                                        dispatch(requestUpdateBeneficiaryPhotoCaseAction(savePayload))
                                                      else
                                                        dispatch(requestUpdatePanCaseAction(savePayload))                                    
                                                    navigation.goBack()   
                                                    }  else {
                                                    await triggerApi()                                                             
                                                    }                                                                 
                                                  }} 
                                                cancelHandler={ () => navigation.goBack()  }/>
                            
 
  return (
    <PaperProvider theme={theme}>
      <LoadingModalWrapper shouldModalBeVisible = {loading === undefined ? false: loading}>
      
      <View style={styles.container}>
        {saveImageAlertBox}
        <View style={styles.middlePhotoContainer} ref={savedPhoto}>
              {displayMapModal}
        </View>

        {canAddPage &&
          <TouchableOpacity style={[styles.prevBtn, styles.retakeBtn, styles.addPageBtn]} onPress={addPage}>
            <Ionicons name="add" size={20} color={palette.onCamera} />
            <Text style={styles.prevBtnText}>{isMissingBack ? 'Take back' : 'Add page'}</Text>
          </TouchableOpacity>}

        <View style={[styles.bottomPrev]}>
          <TouchableOpacity
            style={[styles.prevBtn, styles.retakeBtn]}
            onPress={() => setPhotoData(null)}>
            <Ionicons name="refresh" size={18} color={palette.onCamera} />
            <Text style={styles.prevBtnText}>{pages.length > 1 ? 'Retake all' : 'Retake'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.prevBtn, styles.saveBtn, isMissingBack && styles.disabledBtn]}
            onPress={savePhoto}
            disabled={isMissingBack}
            accessibilityState={{ disabled: isMissingBack }}>
            <Ionicons name="checkmark" size={20} color={palette.onPrimary} />
            <Text style={styles.prevBtnText}>{isDocument ? 'Done' : 'Use photo'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      </LoadingModalWrapper>
    </PaperProvider>
  );
};

// One or two pages are a card's sides; longer documents are numbered
const getPageLabel = (index, total) =>
  total <= 2 ? ['Front', 'Back'][index] : `Page ${index + 1} of ${total}`

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  middlePhotoContainer: {
    marginTop: 80,
    width: (windowWidth - 32),
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: palette.cameraSurface,
  },

  page: {
    width: (windowWidth - 32),
  },
  addPageBtn: {
    flex: 0,
    width: (windowWidth - 2 * spacing.lg),
    marginTop: spacing.lg,
  },
  disabledBtn: {
    opacity: 0.4,
  },
  pageFooter: {
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  pageRetakeBtn: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.cameraBorder,
    backgroundColor: palette.cameraSurface,
  },
  pageLabel: {
    color: palette.onCamera,
    fontWeight: "600",
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  middlePhoto: {

    width: '100%'   ,
    // Without height undefined it won't work
    height: undefined,
    // figure out your image aspect ratio
    aspectRatio: imageRatio*0.75,
    resizeMode: 'center',
  } ,
  bottomPrev: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    width: '100%',
  },
  prevBtn: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  retakeBtn: {
    borderWidth: 1,
    borderColor: palette.cameraBorder,
    backgroundColor: palette.cameraSurface,
  },
  saveBtn: {
    backgroundColor: palette.primary,
  },
  prevBtnText: {
    color: palette.onCamera,
    fontWeight: "600",
    fontSize: 15,
  },
});

export default ImagePreview;
