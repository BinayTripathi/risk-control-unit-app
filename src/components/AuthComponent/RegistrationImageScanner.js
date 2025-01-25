import { useState } from 'react'
import {Text, View, StyleSheet} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import {SCREENS, DOC_TYPE} from '@core/constants'

import Button from '@components/UI/Button'


const RegistrationImageScanner = () => {

  const [photoTaken, setPhotoTaken] = useState(false)
  const navigation = useNavigation();

  const onClickPhoto = () => {
    
    const docType= DOC_TYPE.PHOTO_ID_SCANNER.find((doc) => doc.name ==='Single FaceReader')
    let modDocType = {... docType}
    modDocType.name = 'Agent Face Reader',
    modDocType.cameraType ="front",   
    navigation.navigate(SCREENS.ImageCaptureScreen, {
        docType: modDocType,
        claimId: "AGENT_ONBOARDING",
        email: "AGENT_ONBOARDING"})
} 


  const onClickDocument = () => {
    navigation.navigate(SCREENS.ImageCaptureScreen, {
          docType: DOC_TYPE.DOCUMENT_SCANNER.find((doc) => doc.name ==='PAN'),
          claimId: "AGENT_ONBOARDING",
          email: "AGENT_ONBOARDING"})        
  } 

  return (
   <>
      {!photoTaken && <Button mode="contained" onPress={onClickPhoto} style={styles.button}>  Click Your Photo </Button>}
      {photoTaken && <Button mode="contained" onPress={onClickDocument} style={styles.button}> Click Document's Photo </Button>}
   </>
  )
};
export default RegistrationImageScanner;

const styles = StyleSheet.create({

  wrapper : {
    flex:1,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  button: {
    marginTop: 50
  },


})

  