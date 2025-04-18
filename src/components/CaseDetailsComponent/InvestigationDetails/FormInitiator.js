import { StyleSheet,View, Text , Dimensions, ScrollView, Button as RNButton} from 'react-native';
import Checkbox from 'expo-checkbox';
import { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '@core/theme';
import CustomDateTimePicker from '@components/UI/CustomDateTimePicker'
import  CustomTextInput  from "@components/UI/TextInput";
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button";
import Slider from '@react-native-community/slider';
import { useDebounce } from "use-debounce";
import Button from '@components/UI/Button'
import { Ionicons } from '@expo/vector-icons';

import {requestSaveFormAction} from '@store/ducks/case-submission-slice'
import { UPLOAD_TYPE } from '@core/constants';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const { width, height } = Dimensions.get('window');

const FormInitiator = ({selectedClaimId}) => {

  const caseDetails = useSelector(state => state.casesDetails.selectedCaseDetails)
  const selectedClaim = caseDetails[selectedClaimId]

  const dispatch = useDispatch()
  const [metBeneficiary, setMetBeneficiary] = useState(false);
  const [metNeighbor, setMetNeighbor] = useState(false);
  const [wentToHospital, setWentToHospital] = useState(false);
  const [wentToCremetary, setWentToCremetary] = useState(false);

  const [propertyOwnership, setPropertyOwnership] = useState("owned");
  const [financialStatus, setFinancialStatus] = useState(0.5)

  const [isIllinessTimiingBeforePolicy, setIsIllinessTimiingBeforePolicy] = useState("no");
  const [periodOfTreatment, setPeriodOfTreatment] = useState(0.5)
  
  const [personMet, setPersonMet] = useState('')
  const [debouncedPersonMet] = useDebounce(personMet, 5000);

  const [dateTime, setDateTime] = useState('');
 

  let financialStatusString = financialStatus === 0 ? 'LOW' 
  :  financialStatus === 0.5 ? 'MEDIUM' : 'HIGH'

   let DurationOfTreatmentString = periodOfTreatment === 0 ? 'No treatment' 
  :  financialStatus === 0.5 ? 'Treatment < 6 months' : 'Treatment > 6 months'


  const BenifiaryFormPart = () => {      

    return <View style={{ marginTop: 10, marginBottom: 20, paddingBottom: 10, marginHorizontal: 10, borderBottomColor: 'grey', borderBottomWidth: 3 }}>
      <Text style={styles.label1}>Ownership of residence</Text>
    <RadioButtonGroup containerStyle={{ marginBottom: 10 }}
                      selected={propertyOwnership}
                      onSelected={(value) => setPropertyOwnership(value)}
                      radioBackground="green">
      <RadioButtonItem value="owned" label="OWNED" />
      <RadioButtonItem value="rented" label="RENTED" />
    </RadioButtonGroup>

   

    <Text style={styles.label1}>Perceived financial status</Text>
    <Text style={[{marginLeft: 10, fontWeight: 'bold',color: 'red'}]}>{financialStatusString}</Text>
    <View style = {{borderColor: 'black', borderWidth: 1, marginHorizontal: 20, marginBottom: 20}}> 
      <Slider style={{width: 200, height: 40}}  minimumValue={0} maximumValue={1} step= {0.5} minimumTrackTintColor="#5a5757"
        maximumTrackTintColor="#000000" value={financialStatus} onValueChange = {setFinancialStatus }/>
    </View>    
  </View>
  }

  const NeighbourFormPart = () => {

    const handlePersonMet = (event) => {
      const value = event.target.value;
      setPersonMet(value);
    };

    return <View style= {{paddingBottom : 10}}>
              <CustomTextInput onChangeText={setPersonMet} value={personMet} label="Name of the neighbour met" 
                underlineColor='#6e6d6d' style= {styles.customInputBox}/>
              
              <Text style={styles.label1}> Time when met with Neighbour</Text>  
              <CustomDateTimePicker dateTimeInParent={dateTime} setDateTimeInParent = {setDateTime} label={'Select Date And Time'}>
                <RNButton color="#69696b" />
              </CustomDateTimePicker>
             
            </View>
  }


  const HospitalFormPart = () => {      

    return <View style={{ marginTop: 10, marginBottom: 20, paddingBottom: 10, marginHorizontal: 10, borderBottomColor: 'grey', borderBottomWidth: 3 }}>
      <Text style={styles.label1}>Injury/Illness prior to commencement/revival</Text>
    <RadioButtonGroup containerStyle={{ marginBottom: 10 }}
                      selected={isIllinessTimiingBeforePolicy}
                      onSelected={(value) => setIsIllinessTimiingBeforePolicy(value)}
                      radioBackground="green">
      <RadioButtonItem value="yes" label="YES" />
      <RadioButtonItem value="no" label="NO" />
    </RadioButtonGroup>

   

    <Text style={styles.label1}>Duration of treatment</Text>
    <Text style={[{marginLeft: 10, fontWeight: 'bold',color: 'red'}]}>{DurationOfTreatmentString}</Text>
    <View style = {{borderColor: 'black', borderWidth: 1, marginHorizontal: 20, marginBottom: 20}}> 
      <Slider style={{width: 200, height: 40}}  minimumValue={0} maximumValue={12} step= {6} minimumTrackTintColor="#5a5757"
        maximumTrackTintColor="#000000" value={periodOfTreatment} onValueChange = {setPeriodOfTreatment }/>
    </View>    
  </View>
  }

  const CremetaryFormPart = () => {

    const handlePersonMet = (event) => {
      const value = event.target.value;
      setPersonMet(value);
    };

    return <View style= {{paddingBottom : 10}}>
              <CustomTextInput onChangeText={setPersonMet} value={personMet} label="Name of person met at the cemetery" 
                underlineColor='#6e6d6d' style= {styles.customInputBox}/>
              
              <Text style={styles.label1}> Date and time of death</Text>  
              <CustomDateTimePicker dateTimeInParent={dateTime} setDateTimeInParent = {setDateTime} label={'Select Date And Time'}>
                <RNButton color="#69696b" />
              </CustomDateTimePicker>
             
            </View>
  }





  const showAlert = () =>
  Dialog.show({
    type: ALERT_TYPE.SUCCESS,
    title: 'Form Submission',
    textBody: 'Form Submitted Successfully',
    button: 'OK',          
    onHide: () => { }
  })

  const onSavePressed = async (e) => {

    const quest1 = () => {
      if(selectedClaim?.policy.claimType !== "Death")
        return metBeneficiary === true? propertyOwnership : 'PERSON UNREACHABLE'
      else 
        return metBeneficiary === true? isIllinessTimiingBeforePolicy : 'PERSON UNREACHABLE'
    }

    const quest2 = () => {
      if(selectedClaim?.policy.claimType !== "Death")
        return metBeneficiary === true? financialStatus : 'PERSON UNREACHABLE'
      else 
        return metBeneficiary === true? periodOfTreatment : 'PERSON UNREACHABLE'
    }

    const quest3 = () => {
      if(selectedClaim?.policy.claimType !== "Death" )
        return metNeighbor === true? personMet : 'PERSON UNREACHABLE'
      else 
        return metNeighbor === true? personMet : 'PERSON UNREACHABLE'
    }

    const quest4 = () => {
      if(selectedClaim?.policy.claimType !== "Death" )
        return metNeighbor === true? dateTime : 'PERSON UNREACHABLE'
      else 
        return metNeighbor === true? dateTime : 'PERSON UNREACHABLE'
    }

    let payload = {
      claimId: selectedClaimId,
      formData : {         
        docType: UPLOAD_TYPE.FORM,
        capability: "FORM_TEMPLATE1",
        question1 : quest1(),
        question2 : quest2(),
        question3 : quest3(),
        question4 : quest4()
      }
    }
    
    dispatch(requestSaveFormAction(payload))
    showAlert()
  }




  let benificaryForm = metBeneficiary === true ?<BenifiaryFormPart/> : ""
  let neighbourForm = metNeighbor === true ? NeighbourFormPart() : ""

  let hospitalForm = metBeneficiary === true ?<HospitalFormPart/> : ""
  let cremetoryForm = metNeighbor === true ? CremetaryFormPart() : ""

    return (

      <View>

      <View style = {styles.descriptionContainer}>
            <Text style = {[styles.textBase, styles.description ]}>FORM TEMPLATE </Text>
      </View> 
      
      <ScrollView style={styles.scrollView}>
          <View style={styles.questionaireContainer}>

              <View style={[styles.checkboxContainer, { marginBottom: 0, marginTop: 10,}]}>
                <Checkbox style={styles.checkbox} value={metBeneficiary} onValueChange={setMetBeneficiary} />
                {selectedClaim?.policy.claimType !== "Death" ? 
                   <Text style={styles.label}>Met beneficiary</Text>:
                   <Text style={styles.label}>Visited Hospital</Text>
                   }
              </View>

              
                {selectedClaim?.policy.claimType !== "Death" ? benificaryForm : hospitalForm}



              <View style={[styles.checkboxContainer, { marginBottom: 0, marginTop: 10,}]}>
                <Checkbox style={styles.checkbox} value={metNeighbor} onValueChange={setMetNeighbor} />
                
                {selectedClaim?.policy.claimType !== "Death" ? 
                   <Text style={styles.label}>Met Neighbour</Text>:
                   <Text style={styles.label}>Visited Cremetory</Text>
                   }
              </View>

              {selectedClaim?.policy.claimType !== "Death" ? neighbourForm : cremetoryForm}     

          </View>
      </ScrollView>

      <Button mode="contained" onPress={onSavePressed} 
          style={styles.button}>
          <Ionicons name="save" size={24} color="white" /> SAVE
      </Button>
    </View>
      
    )
}

const styles = StyleSheet.create({
  container: {
    height: height,
    overflow: 'hidden',
    alignItems: "center",      
    paddingHorizontal: 20,
    padding: 50,
  },
  descriptionContainer : {
    marginTop: 40
  } ,

  description: {
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(22, 6, 96, 0.75)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 20,
  }, 

  textBase: {
      color: 'black',
    },

    label: {
      fontSize: 18,
      fontWeight: 'bold',
      margin: 8,
    },
    label1: {
      fontSize: 15,
      fontWeight: 'bold',
      margin: 8,
    },

    questionaireContainer : {
      marginTop: 30,
      width: 280,
      backgroundColor: '#cccccc',
      borderRadius: 20,
      paddingHorizontal: 10,
      shadowOffset: {width: 0, height: 1},
      shadowRadius: 2,
      elevation: 2,
      shadowOpacity: 0.4,
  } ,

  customInputBox:{

    width: '90%'
  },

  inputContainer : {
      marginTop: 30,
      width: '90%',
      //alignItems: "center",
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'white',
      height: 120,
      borderRadius: 20,
      padding: 0,
      shadowOffset: {width: 0, height: 1},
      shadowRadius: 2,
      elevation: 2,
      shadowOpacity: 0.4,

  } ,

  input:{
      alignItems: 'center',
      width: '80%',
      backgroundColor: 'white',        
      textAlignVertical:'top',
      borderRadius: 20,
      padding: 20
    },
    button: {
      marginRight: 5,
      marginBottom: 10
    },
    checkboxContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      marginTop: 20,
    },
    checkbox: {
      margin: 8,
    },
    button: {
      marginTop: 50
    },
})

  export default FormInitiator;