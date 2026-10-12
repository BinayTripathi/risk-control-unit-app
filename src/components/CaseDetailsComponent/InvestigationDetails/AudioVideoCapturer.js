import { StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { actuatedNormalize, actuatedNormalizeVertical} from "@core/PixelScaling";
import ElevatedSurface from '@components/UI/ElevatedSurface'
import RoundButton from '@components/UI/RoundButton'
import { Entypo , FontAwesome} from '@expo/vector-icons';
import { SCREENS, DOC_TYPE, checkLoadingMedia, checkSuccessMedia, checkFailureMedia } from '@core/constants';

const AudioVideoCapturer = ({selectedClaimId, userId, caseUpdates, sectionFromTemplate}) => {

    const navigation = useNavigation();
    const sectionName = sectionFromTemplate.locationName

    const documentScannerType = (investigationName) => DOC_TYPE.MEDIA_SCANNER.find(docScanner => docScanner.name === investigationName)  ??  DOC_TYPE.MEDIA_SCANNER.at(-1)
  

    const onClickDigitalId = (documentObj, documentScannerType) => {
        //if(documentObj.enabled !== true ) return
        navigation.navigate(SCREENS.ImageCaptureScreen, {
          docType: documentScannerType,
          claimId: selectedClaimId,
          email: userId,
          sectionFromTemplate : sectionFromTemplate.locationName,
          investigationName: documentObj.reportName,
          isLastMandatory: false//(mandatoryDocumentListRef.current.size === 1 && mandatoryDocumentListRef.current.has(documentObj.reportType)) || mandatoryDocumentListRef.current.size === 0
          })
    }
    
    return (
        <ElevatedSurface style={styles.surface}>   
            <RoundButton style={styles.button} onPressHandler = {() => onClickDigitalId(sectionFromTemplate.mediaReports[0], documentScannerType(sectionFromTemplate.mediaReports[0].reportName))}>
                {sectionFromTemplate.mediaReports[0].reportName === 'Audio' && <FontAwesome name="microphone" size={50} color="#8c0de0" style={styles.icons} />}
                {sectionFromTemplate.mediaReports[0].reportName === 'Video' && <Entypo name="video-camera" size={50} color="#8c0de0" style={styles.icons}/>}
                {checkLoadingMedia(sectionFromTemplate.mediaReports[0].reportName, sectionName, caseUpdates) && <Image source={require('@root/assets/loading.gif')} style={styles.statusImage} /> }
                {checkSuccessMedia(sectionFromTemplate.mediaReports[0].reportName, sectionName, caseUpdates) && <Image source={require('@root/assets/checkmark.png')} style={styles.statusImage} /> }          
                {checkFailureMedia(sectionFromTemplate.mediaReports[0].reportName, sectionName, caseUpdates) && <Image source={require('@root/assets/failure.png')} style={styles.statusImage} /> }                        
                          
            </RoundButton>

            <RoundButton style={styles.button} onPressHandler = {() => onClickDigitalId(sectionFromTemplate.mediaReports[1], documentScannerType(sectionFromTemplate.mediaReports[1].reportName))}>
              {sectionFromTemplate.mediaReports[1].reportName === 'Audio' && <FontAwesome name="microphone" size={50} color="#8c0de0" style={styles.icons}/>}
              {sectionFromTemplate.mediaReports[1].reportName === 'Video' && <Entypo name="video-camera" size={50} color="#8c0de0" style={styles.icons}/>}
              {checkLoadingMedia(sectionFromTemplate.mediaReports[1].reportName, sectionName, caseUpdates) && <Image source={require('@root/assets/loading.gif')} style={styles.statusImage} /> }
              {checkSuccessMedia(sectionFromTemplate.mediaReports[1].reportName, sectionName, caseUpdates) && <Image source={require('@root/assets/checkmark.png')} style={styles.statusImage} /> }                        
              {checkFailureMedia(sectionFromTemplate.mediaReports[1].reportName, sectionName, caseUpdates) && <Image source={require('@root/assets/failure.png')} style={styles.statusImage} /> }                        
            </RoundButton>
        </ElevatedSurface>
        )
  
    };

    export default AudioVideoCapturer;

const styles = StyleSheet.create({
  surface: {
    height: actuatedNormalizeVertical(120),
    marginTop: actuatedNormalizeVertical(20),
  },

  button: {
    elevation: 5, // Android
    height:  actuatedNormalizeVertical(80),
    width: actuatedNormalize(70),
    borderRadius: actuatedNormalize(40),
     justifyContent: 'center',
    alignItems: 'center', 
  },
  icons: { 
    position: 'relative', 
    top: 10 
  },
   statusImage : {
    width: 20,
    height: 20,
    borderRadius: 10,
    resizeMode: 'contain',
    transform: [{ translateX: 30 }, { translateY: -45 }],
  },
});