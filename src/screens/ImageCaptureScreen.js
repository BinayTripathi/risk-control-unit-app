import { useState } from "react";
import { StyleSheet, View,} from "react-native";

import ImageCapture from '@components/ImageCaptureComponent/ImageCapture'
import DocumentScanner from '@components/ImageCaptureComponent/DocumentCapture'
import ImagePreview from "@components/ImageCaptureComponent/ImagePreview";
import Background from "@components/UI/Background";

import { VideoCapture } from "@components/ImageCaptureComponent/VideoCapture";
import { VideoPreview } from "@components/ImageCaptureComponent/VideoPreview";
import AudioCapture from "@components/ImageCaptureComponent/AudioCapture"
import AudioPreview from "@components/ImageCaptureComponent/AudioPreview"


const ImageCaptureScreen = ({ route }) => {
  
  const [photoData, setPhotoData] = useState(); 
  const [audioLength, setAudioLength] = useState(0)

  const claimId = route.params?.claimId
  const docType = route.params?.docType
  const email = route.params?.email
  const sectionName = route.params?.sectionFromTemplate
  const investigationName = route.params?.investigationName
  const isLastMandatory = route.params?.isLastMandatory
  console.log(`is mandatory last : ${isLastMandatory}`)


  const imageCaptureSceen =  (
    <Background>
        <View style={styles.container}>
        { docType.type === "PHOTO" && <ImageCapture setPhotoData={setPhotoData}  docType = {docType} /> }
        { docType.type === "DOCUMENT" && <DocumentScanner setPhotoData={setPhotoData}  docType = {docType} /> }
         { docType.type === "VIDEO" && <VideoCapture setPhotoData={setPhotoData} docType = {docType} /> }
        { docType.type === "AUDIO" && <AudioCapture setPhotoData={setPhotoData} docType = {docType} setAudioLength={setAudioLength}/> }
        </View>  
        </Background>
     
    )

  const imagePreviewScreen =  (
    <Background>
      <View style={styles.container}>
        { (docType.type === "PHOTO" ||  docType.type === "DOCUMENT") &&
        <ImagePreview photoData= {photoData} setPhotoData={setPhotoData} 
          claimId = {claimId} docType = {docType} email = {email} 
          sectionName = {sectionName} investigationName = {investigationName}
          isLastMandatory = {isLastMandatory}/>
        }

          { docType.type === "VIDEO" &&  
            <VideoPreview photoData= {photoData} setPhotoData={setPhotoData} 
                          claimId = {claimId}
                          docType = {docType} email = {email} 
                          sectionName = {sectionName} investigationName = {investigationName}
                          isLastMandatory = {isLastMandatory}
          />}
          
          { docType.type === "AUDIO" &&  
            <AudioPreview path= {photoData} setPath={setPhotoData} 
                          claimId = {claimId} audioLength={audioLength}
                          docType = {docType} email = {email} 
                          sectionName = {sectionName} investigationName = {investigationName}
                          isLastMandatory = {isLastMandatory}
                          /> }
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
