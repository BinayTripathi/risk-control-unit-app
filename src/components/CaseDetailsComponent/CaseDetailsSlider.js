
import {useState} from "react";
import { StyleSheet, View, ScrollView, Dimensions, PixelRatio}  from 'react-native';
import { useSelector, useDispatch} from 'react-redux'

import CustomerDetails from "./CaseDetails/CustomerDetails";
import PolicyDetailsComponent from "./CaseDetails/PolicyDetails";
import BeneficiaryDetails from "./CaseDetails/BeneficiaryDetails";
import InvestigationDetails from './InvestigationDetails'
import SubmitInvestigation from "./SubmitInvestigation";
import {saveCaseTemplate} from '@store/ducks/case-submission-slice'
import _ from "lodash";

let UNDERWRITING_TEMPLATE = [
  {
    "locationName": "LA ADDRESS",
    "isRequired": true,
    "agent": {
      "isRequired": true,
      "reportType": "Agent Face",
      "reportName": "Agent Face"
    },
    "mediaReports": [
      {
        "mediaType": 0,
        "mediaExtension": "mp3",
        "locationTemplateId": null,
        "locationTemplate": null,
        "id": 0,
        "selected": true,
        "reportName": "Audio",
        "idName": null,
        "idImage": null,
        "idOriginalImage": null,
        "idImageExtension": null,
        "idImageData": "No Location Info...",
        "idImageLocationUrl": null,
        "distance": null,
        "distanceInMetres": null,
        "duration": null,
        "durationInSeconds": null,
        "idImageLocationAddress": "No Address data",
        "idImageLongLat": null,
        "idImageLongLatTime": null,
        "validationExecuted": false,
        "idImageValid": false,
        "isRequired": false,
        "created": "2025-05-23T13:49:05.8532921+00:00",
        "isUpdated": true,
        "updated": null,
        "createdUser": "--",
        "updatedBy": "--"
      },
      {
        "mediaType": 1,
        "mediaExtension": "mp3",
        "locationTemplateId": null,
        "locationTemplate": null,
        "id": 0,
        "selected": true,
        "reportName": "Video",
        "idName": null,
        "idImage": null,
        "idOriginalImage": null,
        "idImageExtension": null,
        "idImageData": "No Location Info...",
        "idImageLocationUrl": null,
        "distance": null,
        "distanceInMetres": null,
        "duration": null,
        "durationInSeconds": null,
        "idImageLocationAddress": "No Address data",
        "idImageLongLat": null,
        "idImageLongLatTime": null,
        "validationExecuted": false,
        "idImageValid": false,
        "isRequired": false,
        "created": "2025-05-23T13:49:05.8532939+00:00",
        "isUpdated": true,
        "updated": null,
        "createdUser": "--",
        "updatedBy": "--"
      }
    ],
    "faceIds": [
      {
        "isRequired": true,
        "reportType": "Customer Face",
        "has2Face": false,
        "reportName": "Customer Face"
      },
      {
        "isRequired": false,
        "reportType": "Beneficiary Face",
        "has2Face": false,
        "reportName": "Beneficiary Face"
      }
    ],
    "documentIds": [
      {
        "isRequired": true,
        "reportType": "PAN Card",
        "reportName": "PAN Card",
        "idImageBack": null
      }
    ],
    "questions": [
      {
        "questionText": "Name Of Person Met (Name & Mobile No.)",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Met Person Relation With LA",
        "questionType": "dropdown",
        "options": "BORTHER, RELATIVE, COUSIN, FRIEND, UNKNOWN",
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "LA Date of Birth",
        "questionType": "date",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Tobacco/ Alcohol or Smoking / swimming /\r\ndiving",
        "questionType": "dropdown",
        "options": "SMOKER, OCCASIONAL DRINKER, DRUG-USER, UNKNOWN",
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "In case LA not healthy –Name of disease/\r\nduration/Place of treatment (hospital and Doctor\r\nname)",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "History of medical investigation, surgery or\r\ntreatment in past or planned in near future (even\r\nif it was a minor or major))",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "Policy Details Other Than Canara HSBC and\r\ntotal life coverage",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "Residence Locality and type",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "Residence Ownership",
        "questionType": "dropdown",
        "options": "RENTED, OWNED, UNKNOWN",
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "No of Year at Current Residence",
        "questionType": "date",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Financial Status of Life Assured (Please mention\r\nyour observation basis life style etc.)",
        "questionType": "dropdown",
        "options": "LOWER CLASS,LOWER- MIDDLE CLASS,MIDDLE CLASS, UPPER CLASS, UNKNOWN",
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "No. Of Family Members and their details",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "LA’s Education Qualification",
        "questionType": "dropdown",
        "options": "PRIMARY SCHOOLING, MATRICULATION, GRADE 12  PASS, GRADUATE, UNKNOWN",
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Employment Category (Salaried /Self employed\r\netc.)",
        "questionType": "dropdown",
        "options": "SALARIED, SELF-EMPLOYED, CASUAL-CONTRACTOR, GOVT-EMPLOYED, UNKNOWN",
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Annual Income",
        "questionType": "dropdown",
        "options": "Rs. 0 - 10000, Rs. 10000 - 100000, Rs. 100000 +, UNKNOWN",
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Nominee Name and relationship with LA",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "Vicinity Check Details – met person Name /\r\nMobile number and details confirmed",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Date and time met with Person",
        "questionType": "date",
        "options": null,
        "isRequired": true,
        "answerText": null
      }
    ]
  }
]

let CLAIM_TEMPLATE = [
  {
    "locationName": "LA ADDRESS",
    "isRequired": true,
    "agent": {
      "isRequired": true,
      "reportType": "Agent Face",
      "reportName": "Agent Face"
    },
    "faceIds": [
      {
        "isRequired": true,
        "reportType": "Beneficiary Face",
        "has2Face": false,
        "reportName": "Beneficiary Face"
      }
    ],
    "documentIds": [
      {
        "isRequired": true,
        "reportType": "PAN Card",
        "reportName": "PAN Card",
        "idImageBack": null
      }
    ],
    "questions": [
      {
        "questionText": "Did Life Assured (LA) had any Injury/Illness prior to commencement/revival ?",
        "questionType": "dropdown",
        "options": "YES, NO, UNKNOWN",
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Duration of treatment ?",
        "questionType": "dropdown",
        "options": "NONE , Less Than 6 months, More Than 6 months, UNKNOWN",
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Name of person met LA Address ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Any Other findings",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      }
    ]
  },
  {
    "locationName": "HOSPITAL",
    "isRequired": false,
    "agent": {
      "isRequired": true,
      "reportType": "Agent Face",
      "reportName": "Agent Face"
    },
    "faceIds": [],
    "documentIds": [
      {
        "isRequired": true,
        "reportType": "Medical Certificate",
        "reportName": "Medical Certificate",
        "idImageBack": null
      }
    ],
    "questions": [
      {
        "questionText": "Name and address of the LA’s usual medical attendant/family doctor during the past 3 years. If more than one, mention all. ?",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "Did LA (Deceased) suffer from any illness or injury prior to the commencement revival of the policy ?",
        "questionType": "checkbox",
        "options": "YES",
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "Full particulars and name(s) of doctors consulted.?",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "LA last illness (mention the period of hospitalization, name(s) of the doctors attended and IP/OP No.?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "When was the disease of which the LA died, first suspected or diagnosed ?",
        "questionType": "date",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Date on which the last attending doctor was first consulted. (During the last illness and or before that) ?",
        "questionType": "date",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Duration of last illness ?",
        "questionType": "dropdown",
        "options": "LESS THAN 1 WEEK, LESS THAN 1 MONTH, LESS THAN 3 MONTH, LESS THAN 6 MONTH, MORE THAN 6 MONTH, UNKNOWN",
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Medical Cause of Death ?",
        "questionType": "dropdown",
        "options": "NATURAL DEATH, ACCIDENT/SUDDEN DEATH, UNKNOWN",
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Did any doctor treat the LA for the same or any other ailment at any time before the commencement  revival of the policy ?",
        "questionType": "checkbox",
        "options": "YES",
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "If YES, what was ailment ?",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "If YES, for how long ?",
        "questionType": "dropdown",
        "options": "LESS THAN 1 WEEK, LESS THAN 1 MONTH, LESS THAN 3 MONTH, LESS THAN 6 MONTH, MORE THAN 6 MONTH, UNKNOWN",
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "Name of Medical staff met ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Any Other findings",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      }
    ]
  },
  {
    "locationName": "BUSINESS",
    "isRequired": false,
    "agent": {
      "isRequired": true,
      "reportType": "Agent Face",
      "reportName": "Agent Face"
    },
    "faceIds": [],
    "documentIds": [
      {
        "isRequired": true,
        "reportType": "Income Tax Return (ITR)",
        "reportName": "Income Tax Return (ITR)",
        "idImageBack": null
      }
    ],
    "questions": [
      {
        "questionText": "How long was Deceased person in the business ?",
        "questionType": "dropdown",
        "options": "NONE , Less Than 6 months, More Than 6 months, UNKNOWN",
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Nature of LA's business at the time of proposal ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Address of business premises ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Name of the Business Associate met ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Any Other findings",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      }
    ]
  },
  {
    "locationName": "CHEMIST",
    "isRequired": false,
    "agent": {
      "isRequired": true,
      "reportType": "Agent Face",
      "reportName": "Agent Face"
    },
    "faceIds": [],
    "documentIds": [
      {
        "isRequired": true,
        "reportType": "Medical Prescription",
        "reportName": "Medical Prescription",
        "idImageBack": null
      }
    ],
    "questions": [
      {
        "questionText": "Chemist Name ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Chemist Address ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Contact Number ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Any Other findings",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      }
    ]
  },
  {
    "locationName": "EMPLOYMENT",
    "isRequired": false,
    "agent": {
      "isRequired": true,
      "reportType": "Agent Face",
      "reportName": "Agent Face"
    },
    "faceIds": [],
    "documentIds": [
      {
        "isRequired": true,
        "reportType": "Employment Record",
        "reportName": "Employment Record",
        "idImageBack": null
      }
    ],
    "questions": [
      {
        "questionText": "Name of the company ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Company Address ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Contact Number ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "whether LA suffered from  any ailment and were they aware as to where LA was being treated ?",
        "questionType": "checkbox",
        "options": "YES",
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "Date of joining employment (service) ?",
        "questionType": "date",
        "options": null,
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "LA's employment nature of duties (role and responsibilites) ?",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "Any Other findings",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      }
    ]
  },
  {
    "locationName": "CEMETERY",
    "isRequired": true,
    "agent": {
      "isRequired": true,
      "reportType": "Agent Face",
      "reportName": "Agent Face"
    },
    "faceIds": [],
    "documentIds": [
      {
        "isRequired": true,
        "reportType": "Death Certificate",
        "reportName": "Death Certificate",
        "idImageBack": null
      }
    ],
    "questions": [
      {
        "questionText": "Name of the Person met at the cemetery ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Designation of the Person met at the cemetery ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Contact Number of the Person met at the cemetery ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Life Assured Cremated / Buried ?",
        "questionType": "radio",
        "options": "Cremated, Buried",
        "isRequired": false,
        "answerText": null
      },
      {
        "questionText": "Any Other findings",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      }
    ]
  },
  {
    "locationName": "POLICE STATION",
    "isRequired": false,
    "agent": {
      "isRequired": true,
      "reportType": "Agent Face",
      "reportName": "Agent Face"
    },
    "faceIds": [],
    "documentIds": [
      {
        "isRequired": true,
        "reportType": "Police FIR Report",
        "reportName": "Police FIR Report",
        "idImageBack": null
      }
    ],
    "questions": [
      {
        "questionText": "Name of the police station and Address ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Name of the Sub Inspector–in-charge of the case ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Date/time when the body sent for Autopsy ?",
        "questionType": "date",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "questionText": "Any Other findings",
        "questionType": "text",
        "options": null,
        "isRequired": false,
        "answerText": null
      }
    ]
  }
]

const { width, height } = Dimensions.get('window');
export default function CaseDetailsSlider({selectedClaimId, selectedClaim, userId, investigatable, isTemplateUpdated}) {

    const dispatch = useDispatch()
    //const [sliderState, setSliderState] = useState({ currentPage: 0 });
    const [sliderState, setSliderState] = useState(() => ({ currentPage: 0 }));

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

      if(!isTemplateUpdated) dispatch(saveCaseTemplate({
        caseId: selectedClaimId,
        caseTemplate: localTemplate
      }))
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

                {selectedClaim !== undefined && investigationSections(selectedClaim?.policy.claimType === "Death" ? CLAIM_TEMPLATE: UNDERWRITING_TEMPLATE, selectedClaimId, userId, width, height)}
                
                {selectedClaim !== undefined &&
                <View style={{ width, height }}>
                    <SubmitInvestigation selectedClaimId = {selectedClaimId} userId = {userId}  selectedClaim = {selectedClaim}/>
                </View>}
            
            </ScrollView>
            <View style={styles.paginationWrapper}>
            {selectedClaim !== undefined && Array.from(Array(3 + (selectedClaim?.policy.claimType === "Death" ? CLAIM_TEMPLATE: UNDERWRITING_TEMPLATE).length).keys()).map((key, index) => (
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