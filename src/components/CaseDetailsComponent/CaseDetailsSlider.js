
import {useState, useEffect} from "react";
import { StyleSheet, View, ScrollView, Dimensions, PixelRatio}  from 'react-native';
import { useSelector, useDispatch} from 'react-redux'

import CustomerDetails from "./CaseDetails/CustomerDetails";
import PolicyDetailsComponent from "./CaseDetails/PolicyDetails";
import BeneficiaryDetails from "./CaseDetails/BeneficiaryDetails";
import InvestigationDetails from './InvestigationDetails'
import SubmitInvestigation from "./SubmitInvestigation";
import {saveCaseTemplate} from '@store/ducks/case-submission-slice'
import {getDefaultCaseTemplate} from '@core/defaultCaseTemplates'
import _ from "lodash";

const { width, height } = Dimensions.get('window');
export default function CaseDetailsSlider({selectedClaimId, selectedClaim, userId, investigatable, isTemplateUpdated}) {

    const dispatch = useDispatch()
    //const [sliderState, setSliderState] = useState({ currentPage: 0 });
    const [sliderState, setSliderState] = useState(() => ({ currentPage: 0 }));
    const [localTemplateState, setLocalTemplateState] = useState(null)
    // Template fetched from server on first load of the case and kept in redux.
    // Fall back to the bundled template for cases loaded before server templates existed.
    const storedTemplate = useSelector(state => state.casesDetails.caseTemplates?.[selectedClaimId])
    const caseTemplate = storedTemplate ?? getDefaultCaseTemplate(selectedClaim?.policy?.claimType)

    const setSliderPage = (event) => {
      const indexOfNextScreen = Math.floor(event.nativeEvent.contentOffset.x / width);
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
    

    return (
        <View style={{ flex: 1 }}>

            <ScrollView
            style={{ flex: 1 }}
            horizontal={true}
            scrollEventThrottle={16}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
                setSliderPage(event);
            }}>               
                       

                {selectedClaim !== undefined &&
                       <View style={{ width, height }}>
                    <PolicyDetailsComponent selectedClaim = {selectedClaim}/>
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
            <View style={styles.paginationWrapper}>
            {selectedClaim !== undefined && Array.from(Array(3 + caseTemplate.length).keys()).map((key, index) => (
                <View style={[styles.paginationDots, { opacity: pageIndex === index ? 1 : 0.2 }]} key={index} />
            ))}
            </View>
   </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    imageStyle: {
      height: PixelRatio.getPixelSizeForLayoutSize(135),
      width: '100%',
    },
  
      
    paginationWrapper: {
      position: 'absolute',
      //bottom: 20,
      top: height - 20,
      left: 0,
      right: 0,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    paginationDots: {
      height: 10,
      width: 10,
      borderRadius: 10 / 2,
      backgroundColor: '#e8500f',
      marginLeft: 10,
    },
  });