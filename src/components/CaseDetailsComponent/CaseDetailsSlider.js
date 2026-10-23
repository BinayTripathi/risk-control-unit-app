
import {useState, useEffect, useRef} from "react";
import { StyleSheet, View, ScrollView, Dimensions, Text, Pressable}  from 'react-native';
import { useSelector, useDispatch} from 'react-redux'

import CustomerDetails from "./CaseDetails/CustomerDetails";
import PolicyDetailsComponent from "./CaseDetails/PolicyDetails";
import BeneficiaryDetails from "./CaseDetails/BeneficiaryDetails";
import InvestigationDetails from './InvestigationDetails'
import SubmitInvestigation from "./SubmitInvestigation";
import {saveCaseTemplate} from '@store/ducks/case-submission-slice'
import {getDefaultCaseTemplate} from '@core/defaultCaseTemplates'
import { palette, spacing } from '@core/theme';
import _ from "lodash";

export default function CaseDetailsSlider({selectedClaimId, selectedClaim, userId, investigatable, isTemplateUpdated}) {

    const dispatch = useDispatch()
    //const [sliderState, setSliderState] = useState({ currentPage: 0 });
    const [sliderState, setSliderState] = useState(() => ({ currentPage: 0 }));
    const [localTemplateState, setLocalTemplateState] = useState(null)
    // Pages are sized to the measured pager area (below the header and step bar)
    const [pageSize, setPageSize] = useState(() => Dimensions.get('window'))
    const scrollRef = useRef(null)
    // Template fetched from server on first load of the case and kept in redux.
    // Fall back to the bundled template for cases loaded before server templates existed.
    const storedTemplate = useSelector(state => state.casesDetails.caseTemplates?.[selectedClaimId])
    const caseTemplate = storedTemplate ?? getDefaultCaseTemplate(selectedClaim?.policy?.claimType)

    const setSliderPage = (event) => {
      const indexOfNextScreen = Math.round(event.nativeEvent.contentOffset.x / pageSize.width);
      setSliderState(prevState => 
        prevState.currentPage !== indexOfNextScreen ? { currentPage: indexOfNextScreen } : prevState
      );
    };
  
    /*const setSliderPage = (event) => {
      const { currentPage } = sliderState;
      const { x } = event.nativeEvent.contentOffset;
      const indexOfNextScreen = Math.floor(x / width);
      if (indexOfNextScreen !== currentPage) {
        setSliderState({
          ...sliderState,
          currentPage: indexOfNextScreen,
        });
      }
    };*/
  
    const { currentPage: pageIndex } = sliderState;


    useEffect(() => {
      console.log(`useEffect in slider ${isTemplateUpdated}  ${localTemplateState}`)
    if(!isTemplateUpdated && localTemplateState !== null){
      console.log(`saving local template for case ${selectedClaimId}`)
        dispatch(saveCaseTemplate(localTemplateState))
    } 
  }, [isTemplateUpdated, localTemplateState]);

    
    const investigationSections = (template, selectedClaimId, userId, width, height) => {

      let localTemplate = {}
      
      let investigationDetails =  template.map((eachSection, index) => {

        localTemplate[eachSection.locationName] = {
          completed : {
            'faceIds' : false,
            'documentId' : false,
            'questions': false
          },
          isRequired: eachSection.isRequired
        }
        let newEachSection = _.cloneDeep(eachSection);
    
        // Ensure faceIds is initialized
        newEachSection.faceIds = newEachSection.faceIds || [];
    
        // Add agentId to faceIds array
        if (newEachSection.agent) {
          newEachSection.faceIds.unshift(newEachSection.agent);
        }

        //Update the template in redux only once
        if (!isTemplateUpdated) {
          let localFaceId = {}
          newEachSection.faceIds.forEach(element => {
            localFaceId[element.reportName] = {
              isRequired : element.isRequired
            }
          });
          localTemplate[eachSection.locationName]['faceIds'] = localFaceId
  
          let localDocId = {}
          newEachSection.documentIds.forEach(element => {
            localDocId[element.reportType] = {
              isRequired : element.isRequired
            }
          });
          localTemplate[eachSection.locationName]['documentIds'] = localDocId
  
          let localQuestions = {}
          newEachSection.questions.forEach(element => {
            localQuestions[element.questionText] = {
              questionText: element.questionText,
              questionType: element.questionType,
              options: element.options,
              isRequired: element.isRequired,
              answerText:  element.isRequired? null : ''   // default Answer is '' if its an optional question 
            }
          });
          localTemplate[eachSection.locationName]['questions']= localQuestions


          let localMediaId = {}
          newEachSection.mediaReports?.forEach(element => {
            localMediaId[element.reportType] = {
              isRequired : element.isRequired
            }
          });
          localTemplate[eachSection.locationName]['mediaReports'] = localMediaId
        }
       
    
        return (
          <View style={{ width, height }} key={newEachSection.id || index}>
            <InvestigationDetails
              selectedClaimId={selectedClaimId}
              userId={userId}
              sectionFromTemplate={newEachSection}
            />
          </View>
        );
      });

      /*if(!isTemplateUpdated) dispatch(saveCaseTemplate({
        caseId: selectedClaimId,
        caseTemplate: localTemplate
      }))*/

     if(!isTemplateUpdated && localTemplateState === null)
        setLocalTemplateState({
        caseId: selectedClaimId,
        caseTemplate: localTemplate
      })

      return investigationDetails
    };
    

    const { width, height } = pageSize;
    const steps = selectedClaim === undefined ? [] : [
      'Policy',
      selectedClaim?.policy.claimType === "Death" ? 'Beneficiary' : 'Customer',
      ...caseTemplate.map(section => section.locationName),
      'Submit',
    ];

    const goToStep = (index) => scrollRef.current?.scrollTo({ x: index * width, animated: true });

    return (
        <View style={styles.container}>

            {steps.length > 0 && (
              <View style={styles.stepBar}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle} numberOfLines={1}>{steps[pageIndex]}</Text>
                  <Text style={styles.stepCount}>Step {Math.min(pageIndex + 1, steps.length)} of {steps.length}</Text>
                </View>
                <View style={styles.stepSegments}>
                  {steps.map((step, index) => (
                    <Pressable key={index} style={styles.segmentHit} onPress={() => goToStep(index)} hitSlop={{ top: 8, bottom: 8 }}
                      accessibilityLabel={`Go to ${step}`}>
                      <View style={[styles.segment, index < pageIndex && styles.segmentDone, index === pageIndex && styles.segmentActive]} />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.pager} onLayout={(event) => {
              const { width: w, height: h } = event.nativeEvent.layout;
              if (w !== pageSize.width || h !== pageSize.height) setPageSize({ width: w, height: h });
            }}>
            <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            horizontal={true}
            scrollEventThrottle={16}
            pagingEnabled={true}
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
                setSliderPage(event);
            }}>

                {selectedClaim !== undefined &&
                       <View style={{ width, height }}>
                    <PolicyDetailsComponent selectedClaim = {selectedClaim} selectedClaimId = {selectedClaimId}/>
                </View>}

                {selectedClaim !== undefined && selectedClaim?.policy.claimType !== "Death"  && <View style={{ width, height }}>
                    <CustomerDetails selectedClaim = {selectedClaim}/>
                </View>}
                {selectedClaim !== undefined && selectedClaim?.policy.claimType === "Death" && <View style={{ width, height }}>
                    <BeneficiaryDetails selectedClaim = {selectedClaim}/>
                </View>}

                {selectedClaim !== undefined && investigationSections(caseTemplate, selectedClaimId, userId, width, height)}

                {selectedClaim !== undefined &&
                <View style={{ width, height }}>
                    <SubmitInvestigation selectedClaimId = {selectedClaimId} userId = {userId}  selectedClaim = {selectedClaim}/>
                </View>}

            </ScrollView>
            </View>
   </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: palette.background,
    },
    pager: {
      flex: 1,
    },
    stepBar: {
      backgroundColor: palette.surface,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.border,
    },
    stepHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    stepTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      color: palette.primary,
      marginRight: spacing.md,
    },
    stepCount: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.subText,
    },
    stepSegments: {
      flexDirection: 'row',
      gap: 4,
    },
    segmentHit: {
      flex: 1,
    },
    segment: {
      height: 5,
      borderRadius: 3,
      backgroundColor: palette.border,
    },
    segmentDone: {
      backgroundColor: palette.primary,
    },
    segmentActive: {
      backgroundColor: palette.accent,
    },
  });
