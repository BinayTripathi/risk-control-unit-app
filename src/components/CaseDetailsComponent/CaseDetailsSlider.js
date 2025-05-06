
import {useState} from "react";
import { StyleSheet, View, ScrollView, Dimensions, PixelRatio}  from 'react-native';

import CustomerDetails from "./CaseDetails/CustomerDetails";
import PolicyDetailsComponent from "./CaseDetails/PolicyDetails";
import BeneficiaryDetails from "./CaseDetails/BeneficiaryDetails";
import InvestigationDetails from './InvestigationDetails'
import SubmitInvestigation from "./SubmitInvestigation";
import _ from "lodash";



let CLAIM_TEMPLATE = [
  {
    "locationName": "VERIFIER_ADDRESS",
    "agent": {
      "reportType": "AGENT_FACE",
      "reportName": "AGENT_PHOTO"
    },
    "faceIds": [
      {
        "reportType": "SINGLE_FACE",
        "has2Face": false,
        "reportName": "BENEFICIARY"
      }
    ],
    "documentIds": [
      {
        "reportType": "PAN",
        "reportName": "PAN",
        "idImageBack": null
      }
    ],
    "questions": [
      {
        "id": 33,
        "questionText": "Injury/Illness prior to commencement/revival ?",
        "questionType": "dropdown",
        "options": "YES, NO",
        "isRequired": true,
        "answerText": null
      },
      {
        "id": 34,
        "questionText": "Duration of treatment ?",
        "questionType": "dropdown",
        "options": "0 , Less Than 6 months, More Than 6 months",
        "isRequired": true,
        "answerText": null
      },
      {
        "id": 35,
        "questionText": "Name of person met at the cemetery",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "id": 36,
        "questionText": "Date and time of death",
        "questionType": "date",
        "options": null,
        "isRequired": true,
        "answerText": null
      }
    ]
  },
  {
    "locationName": "POLICE_STATION",
    "agent": {
      "reportType": "AGENT_FACE",
      "reportName": "AGENT_PHOTO"
    },
    "faceIds": [],
    "documentIds": [
      {
        "reportType": "POLICE_REPORT",
        "reportName": "POLICE_REPORT",
        "idImageBack": null
      }
    ],
    "questions": [
      {
        "id": 37,
        "questionText": "Cause of Death ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "id": 38,
        "questionText": "Name of Policeman met ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "id": 39,
        "questionText": "Was there any foul play ?",
        "questionType": "dropdown",
        "options": "YES, NO",
        "isRequired": true,
        "answerText": null
      },
      {
        "id": 40,
        "questionText": "Date time of Policeman met ?",
        "questionType": "date",
        "options": null,
        "isRequired": true,
        "answerText": null
      }
    ]
  },
  {
    "locationName": "HOSPITAL",
    "agent": {
      "reportType": "AGENT_FACE",
      "reportName": "AGENT_PHOTO"
    },
    "faceIds": [],
    "documentIds": [
      {
        "reportType": "MEDICAL_CERTIFICATE",
        "reportName": "MEDICAL_CERTIFICATE",
        "idImageBack": null
      }
    ],
    "questions": [
      {
        "id": 41,
        "questionText": "Nature of death ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "id": 42,
        "questionText": "Name of Medical staff met ?",
        "questionType": "text",
        "options": null,
        "isRequired": true,
        "answerText": null
      },
      {
        "id": 43,
        "questionText": "Was there any foul play ?",
        "questionType": "dropdown",
        "options": "YES, NO",
        "isRequired": true,
        "answerText": null
      },
      {
        "id": 44,
        "questionText": "Date time of Medical staff  met ?",
        "questionType": "date",
        "options": null,
        "isRequired": true,
        "answerText": null
      }
    ]
  }
]

const { width, height } = Dimensions.get('window');
export default function CaseDetailsSlider({selectedClaimId, selectedClaim, userId, investigatable}) {

  
    const [sliderState, setSliderState] = useState({ currentPage: 0 });
  
    const setSliderPage = (event) => {
      const { currentPage } = sliderState;
      const { x } = event.nativeEvent.contentOffset;
      const indexOfNextScreen = Math.floor(x / width);
      if (indexOfNextScreen !== currentPage) {
        setSliderState({
          ...sliderState,
          currentPage: indexOfNextScreen,
        });
      }
    };
  
    const { currentPage: pageIndex } = sliderState;

    
    const investigationsSections =  CLAIM_TEMPLATE.map((eachSection, index) => {
      let newEachSection = _.cloneDeep(eachSection)
      if(newEachSection?.faceIds && newEachSection?.agent)   // if both agentid and faceid array present
        newEachSection.faceIds.unshift(newEachSection.agent)
      else if(newEachSection?.agent) {   // if only agentId
        newEachSection.faceIds = [newEachSection.agent]
      }
      console.log(JSON.stringify(newEachSection))
      return (<View style={{ width, height }} key={index}>
                <InvestigationDetails selectedClaim = {selectedClaim} userId = {userId} sectionFromTemplate = {newEachSection}></InvestigationDetails>
      </View>)
    }
      
    )
    

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
                       

                <View style={{ width, height }}>
                    <PolicyDetailsComponent selectedClaim = {selectedClaim}/>
                </View>
                
                {selectedClaim?.policy.claimType !== "Death"  && <View style={{ width, height }}>
                    <CustomerDetails selectedClaim = {selectedClaim}/>
                </View>}
                {selectedClaim?.policy.claimType === "Death" && <View style={{ width, height }}>
                    <BeneficiaryDetails selectedClaim = {selectedClaim}/>
                </View>}

                {investigationsSections}
                
                <View style={{ width, height }}>
                    <SubmitInvestigation selectedClaimId = {selectedClaimId} userId = {userId}  selectedClaim = {selectedClaim}/>
                </View>
            
            </ScrollView>
            <View style={styles.paginationWrapper}>
            {Array.from(Array(investigatable? 6 + CLAIM_TEMPLATE.length: 3 + CLAIM_TEMPLATE.length).keys()).map((key, index) => (
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