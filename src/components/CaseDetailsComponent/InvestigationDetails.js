import { StyleSheet, View, ScrollView } from 'react-native';
import  { useSelector } from 'react-redux';

import CollapsibleSection from '@components/UI/CollapsableSection'
import SectionHeading from '@components/UI/SectionHeading'
import PhotoIdScanner from './InvestigationDetails/PhotoIdScanner'
import DocumentScanner from './InvestigationDetails/DocumentScanner'
import FormInitiator from './InvestigationDetails/FormInitiator'
import AudioVideoCapturer from './InvestigationDetails/AudioVideoCapturer';
import { spacing } from '@core/theme';


export default InvestigationDetails = function ({selectedClaimId, userId, sectionFromTemplate}) {

  let allCaseUpdates = useSelector((state) => state.casesUpdates.casesUpdates);
  const caseUpdates = allCaseUpdates[selectedClaimId]
  const completed = caseUpdates?.[sectionFromTemplate.locationName]?.['completed']


    return (

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <SectionHeading
          overline="Investigation"
          title={sectionFromTemplate.locationName}
          required={sectionFromTemplate.isRequired}
          subtitle="Capture each item below at this location." />

        {caseUpdates !== undefined && <View>

            <CollapsibleSection title="Face ID" icon="person-circle-outline" sectionComplete = {completed?.['faceIds']}>
                <PhotoIdScanner selectedClaimId = {selectedClaimId}  userId = {userId} caseUpdates = {caseUpdates} sectionFromTemplate = {sectionFromTemplate}/>
            </CollapsibleSection>

            <CollapsibleSection title="Documents" icon="document-text-outline" sectionComplete = {completed?.['documentId']}>
                  <DocumentScanner selectedClaimId = {selectedClaimId}  userId = {userId} caseUpdates = {caseUpdates} sectionFromTemplate = {sectionFromTemplate}/>
            </CollapsibleSection>

            <CollapsibleSection title="Questionnaire" icon="list-outline" sectionComplete = {completed?.['questions']}>
              <FormInitiator selectedClaimId = {selectedClaimId}  userId = {userId} caseUpdates = {caseUpdates} sectionFromTemplate = {sectionFromTemplate}/>
            </CollapsibleSection>

            {sectionFromTemplate['mediaReports'] !== undefined && sectionFromTemplate['mediaReports'].length > 0 && <CollapsibleSection title="Media" icon="mic-outline" sectionComplete = {completed?.['mediaReport']}>
              <AudioVideoCapturer selectedClaimId = {selectedClaimId}  userId = {userId} caseUpdates = {caseUpdates} sectionFromTemplate = {sectionFromTemplate}/>
            </CollapsibleSection>}

        </View>}
      </ScrollView>

    );


}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
})
