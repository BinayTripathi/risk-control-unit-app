import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { actuatedNormalize, actuatedNormalizeVertical} from "@core/PixelScaling";
import ElevatedSurface from '@components/UI/ElevatedSurface'
import RoundButton from '@components/UI/RoundButton'
import { Entypo , FontAwesome} from '@expo/vector-icons';
import {DOC_TYPE, SCREENS } from '@core/constants';

const AudioVideoCapturer = ({selectedClaimId, userId, sectionFromTemplate}) => {

    const navigation = useNavigation();

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
                <Entypo name="video-camera" size={50} color="#083596" />
            </RoundButton>

            <RoundButton style={styles.button} onPressHandler = {() => onClickDigitalId(sectionFromTemplate.mediaReports[1], documentScannerType(sectionFromTemplate.mediaReports[1].reportName))}>
              <FontAwesome name="microphone" size={50} color="#22c970" /></RoundButton>
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
  },
});