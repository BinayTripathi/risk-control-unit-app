import { useState } from "react";
import { StyleSheet, View,} from "react-native";

import ImageCapture from '@components/ImageCaptureComponent/ImageCapture'
import DocumentScanner from '@components/ImageCaptureComponent/DocumentCapture'
import ImagePreview from "@components/ImageCaptureComponent/ImagePreview";
import Background from "@components/UI/Background";


const ImageCaptureScreen = ({ route }) => {
  
  const [photoData, setPhotoData] = useState(); 
  const [bothEyeOpen, setBothEyeOpen] = useState(false)
  const [smiling, setSmiling] = useState(false)

  const claimId = route.params?.claimId
  const docType = route.params?.docType
  const email = route.params?.email


  const imageCaptureSceen =  (
    <Background>
        <View style={styles.container}>
        { docType.type === "PHOTO" && <ImageCapture setPhotoData={setPhotoData} setBothEyeOpen={setBothEyeOpen} setSmiling={setSmiling} docType = {docType}/> }
        { docType.type === "DOCUMENT" && <DocumentScanner setPhotoData={setPhotoData} setBothEyeOpen={setBothEyeOpen} setSmiling={setSmiling} docType = {docType}/> }
        </View>  
        </Background>
     
    )

  const imagePreviewScreen =  (
    <Background>
      <View style={styles.container}>
        <ImagePreview photoData= {photoData} setPhotoData={setPhotoData} isSmiling={smiling} isBothEyeOpen={bothEyeOpen} claimId = {claimId} docType = {docType} email = {email}/>
      </View>  
    </Background>
  )

 if(!photoData)    
    return imageCaptureSceen
   else
    return imagePreviewScreen

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ImageCaptureScreen;
