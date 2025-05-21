import React, {  useEffect, useRef, useState  } from "react";
import { StyleSheet,Text,TouchableOpacity, View, Image, Alert, Dimensions} from "react-native";
import { useDispatch} from 'react-redux'
import { useNavigation } from "@react-navigation/native";
import { PaperProvider } from 'react-native-paper';

import {userRegisterPhoto} from '@services/RestServiceCalls'
import useApi from '@hooks/useApi'
import UserTracker from "./UserTracker";
import {requestRegisterUser} from '@store/ducks/userSlice'

import {theme} from '../../core/theme'
import { UPLOAD_TYPE, SECURE_REGISTRATION_COMPLETE } from '@core/constants';
import {secureSave} from '@helpers/SecureStore'

import {requestUpdateBeneficiaryPhotoCaseAction, requestUpdatePanCaseAction} from '@store/ducks/case-submission-slice'
import useLocationTracker from "@hooks/useLocationTracker";
import LoadingModalWrapper from '@components/UI/LoadingModal';

import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import OkayCancelDialogBox from "@components/UI/OkayCancelDialogBox";


let imageRatio = 1
//https://www.farhansayshi.com/post/how-to-save-files-to-a-device-folder-using-expo-and-react-native/
const ImagePreview = ({photoData, setPhotoData ,claimId, docType, email, sectionName,
  investigationName}) => {
  
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
          onHide:() => {
            //secureSave(SECURE_REGISTRATION_COMPLETE,"true")
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
    Image.getSize(`${photoData}`, (width, height) => {imageRatio = width/ width});

    

      console.log(imageRatio)


       
    
    const savePhoto = async () => {        

      const documentDetailsForSubmission = {
        email : email,
        caseId: claimId,            
        Remarks:null,
        docType: docType.type,
        capability: docType.name,
        sectionName,
        investigationName
      }
      
      if(docType.type === UPLOAD_TYPE.PHOTO){
        documentDetailsForSubmission.LocationLongLat = tracker
        documentDetailsForSubmission.locationImage = photoData
      } else {
        documentDetailsForSubmission.OcrLongLat = tracker
        documentDetailsForSubmission.OcrImage = photoData
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

    const displayMapHandler = () => {
      setDisplayMap((displayMap) => !displayMap)     
    }
    

    const displayMapModal = displayMap ?                             
                              <UserTracker photoData={photoData} displayMapHandler={displayMapHandler} shouldDisplayMap = {displayMap}/>
                             : ( <>
                                 <UserTracker photoData={false}/>
                                 <Image source={{uri: photoData}} style={styles.middlePhoto}  />
                                   </> )

  const saveImageAlertBox = <OkayCancelDialogBox showDialog={showSaveDialog} 
                                                setShowDialog={setShowSaveDialog}
                                                title={'Save Item'} 
                                                content={(`Do you want to save ${docType.name}`)} 
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
    <PaperProvider>
      <LoadingModalWrapper shouldModalBeVisible = {loading === undefined ? false: loading}>
      
      <View style={styles.container}>
        {saveImageAlertBox}
        <View style={styles.middlePhotoContainer} ref={savedPhoto}>
              {displayMapModal}
        </View>

        <View style={[styles.bottomPrev]}>
          <TouchableOpacity
            style={styles.prevBtn}
            onPress={() => setPhotoData(null)}>
            <Text style={styles.prevBtnText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.prevBtn, { marginLeft: 25 }]}
            onPress={savePhoto}>
            <Text style={styles.prevBtnText}>Save Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
      </LoadingModalWrapper>
    </PaperProvider>
  );
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  middlePhotoContainer: {   
 
    marginTop: 80,
    paddingHorizontal: 5,
    borderWidth: 5,
    borderRadius: 10,
    
    width: (windowWidth - 20),
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
    height: 100,    
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 10
  },
  prevBtn: {
    height: 65,
    width: 140,
    backgroundColor: theme.colors.primary,
    color: theme.colors.inversePrimary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    marginTop: 20,
    elevation: 4,
  },
  prevBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default ImagePreview;
