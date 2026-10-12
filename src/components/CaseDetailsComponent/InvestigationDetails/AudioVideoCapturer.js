import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CaptureItemCard from '@components/UI/CaptureItemCard'
import { palette } from '@core/theme';
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

    const mediaStatus = (reportName) =>
        checkSuccessMedia(reportName, sectionName, caseUpdates) ? 'success'
        : checkFailureMedia(reportName, sectionName, caseUpdates) ? 'failure'
        : checkLoadingMedia(reportName, sectionName, caseUpdates) ? 'loading'
        : 'idle'

    return (
        <View style={styles.container}>
            {sectionFromTemplate.mediaReports.map((mediaReport, index) => (
                <CaptureItemCard
                    key={index}
                    title={mediaReport.reportName === 'Video' ? 'Video recording' : mediaReport.reportName === 'Audio' ? 'Audio recording' : mediaReport.reportName}
                    required={mediaReport.isRequired}
                    icon={<Ionicons name={mediaReport.reportName === 'Video' ? 'videocam-outline' : 'mic-outline'} size={26} color={palette.accent} />}
                    status={mediaStatus(mediaReport.reportName)}
                    onCapture={() => onClickDigitalId(mediaReport, documentScannerType(mediaReport.reportName))}
                />
            ))}
        </View>
        )

    };

    export default AudioVideoCapturer;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
