import { StyleSheet,View, Text , Dimensions, ScrollView, Button as RNButton, TextInput, TouchableOpacity, Platform} from 'react-native';
import Checkbox from 'expo-checkbox';
import { useState, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '@core/theme';
import CustomDateTimePicker from '@components/UI/CustomDateTimePicker'
import DateTimePicker from '@react-native-community/datetimepicker';
import  CustomTextInput  from "@components/UI/TextInput";
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button";
import Slider from '@react-native-community/slider';
import { useDebounce } from "use-debounce";
import Button from '@components/UI/Button'
import { Ionicons } from '@expo/vector-icons';

import {requestSaveFormAction} from '@store/ducks/case-submission-slice'
import { UPLOAD_TYPE, questionsSubSection } from '@core/constants';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const { width, height } = Dimensions.get('window');

const FormInitiator = ({selectedClaimId, userId, caseUpdates, sectionFromTemplate}) => {

  console.log('within form : ' + JSON.stringify(caseUpdates?.[sectionFromTemplate.locationName]?.[questionsSubSection]))
  const [answers, setAnswers] = useState(caseUpdates?.[sectionFromTemplate.locationName]?.[questionsSubSection] ?? {});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const mandatoryQuestionsListRef = useRef(new Set());

  const handleInputChange = (question, value) => {
    question.answerText = value
    setAnswers({ ...answers, [question.questionText]: question });

    //const newMandatoryQuestionList = mandatoryQuestionsListRef.current.filter(quest => quest !== question.questionText);
    mandatoryQuestionsListRef.current.delete(question.questionText)
    
  };

  const openDatePicker = (question) => {
    setCurrentQuestion(question);
    setSelectedDate(new Date()); // Reset to default or previously selected value
    setShowDatePicker(true);
  };

  const handleDateChange = (event, date) => {
    if (date) {
      handleInputChange(currentQuestion, date.toISOString());
    }
    setShowDatePicker(false);
  };

  const dispatch = useDispatch()

  let dataCapturePoints = sectionFromTemplate.questions.map((question, index)=> {     

    if(question.isRequired && !answers?.[question.questionText]) {
      mandatoryQuestionsListRef.current.add(question.questionText)    }
      
    return( <View style={{ marginTop: 10, marginBottom: 20, paddingBottom: 10, marginHorizontal: 10, borderBottomColor: 'grey', borderBottomWidth: 3 }} key={index}>
              <Text style={styles.label1}>{question.questionText} {question.isRequired && ( <Text style={{ color: 'blue' }}>*</Text>)}</Text>

              {question.questionType === 'multiText' && (
                    <View style={styles.inputContainer}>
                                  <TextInput
                                          placeholder="Enter investigation comments"
                                          onChangeText={(val) => handleInputChange(question, val)}
                                          multiline={true}
                                          numberOfLines={50}
                                          keyboardType={
                                          Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password' }
                                          style={styles.input}  />
                                </View>   
              )}

              {question.questionType === 'text' && (
                    <TextInput style={{ borderBottomWidth: 1 }} value = {answers[question.questionText]?.answerText} onChangeText={(val) => handleInputChange(question, val)} />
              )}
              
              {question.questionType === 'date' && (
                    <TouchableOpacity onPress={() => openDatePicker(question)}>
                      <Text style={{ color: 'blue' }}>{answers[question.questionText]?.answerText || 'Select Date'}</Text> 
                    </TouchableOpacity>
                  )}
              {question.questionType === 'dropdown' && (
                <RadioButtonGroup containerStyle={{ marginBottom: 10 }}
                      selected={answers[question.questionText]?.answerText}
                      onSelected={(value) => handleInputChange(question, value)}
                      radioBackground="green">
                        {question.options.split(', ').map((option, i) => (
                          <RadioButtonItem key={i} value={option} label={option} />
                      ))}
              
              </RadioButtonGroup>

                )}

              {question.questionType === 'checkbox' && (
                <View style={{ flexDirection: 'column' }}>
                  {question.options?.split(', ').map((option, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Checkbox
                        value={answers[question.questionText] !== undefined && answers[question.questionText].options.includes(option) ? true: false}
                        onValueChange={(isChecked) => {
                          let updatedValues = answers[question.questionText]?.answerText || []; 
                          updatedValues = isChecked
                            ? [...updatedValues, option]
                            : updatedValues.filter((val) => val !== option);
                          handleInputChange(question, updatedValues);
                        }}
                      />
                      <Text>{option}</Text>
                    </View>
                  ))}
                </View>
              )}
      </View>)

  })


  const showSavedAlert = () =>
  Dialog.show({
    type: ALERT_TYPE.SUCCESS,
    title: 'Form Submission',
    textBody: 'Form Submitted Successfully',
    button: 'OK',          
    onHide: () => { }
  })

  const showIncompleteFormAlert = () =>
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: 'Form Submission',
      textBody: 'Please complete the form before submitting',
      button: 'OK',          
      onHide: () => { }
    })

  const onSavePressed = async (e) => {

    if(mandatoryQuestionsListRef.current.size !== 0){
      showIncompleteFormAlert()
      return
    }

    const formDetailsForSubmission = {
      email : userId,
      caseId: selectedClaimId,            
      docType: UPLOAD_TYPE.FORM,
      capability: "FORM_TEMPLATE1",
      sectionName: sectionFromTemplate.locationName,
      qna:  Object.entries(answers).map(([key, value]) => value)
    }        

    const formKey = formDetailsForSubmission.sectionName + '~' + formDetailsForSubmission.capability
    const payloadToSave = {
      caseId: selectedClaimId,
      section:  sectionFromTemplate.locationName,
      documentCategory : questionsSubSection,
      documentDetails: formDetailsForSubmission,
      id: Math.floor(1000 + Math.random() * 9000) * -1
    }

    console.log(formDetailsForSubmission.qna)
    dispatch(requestSaveFormAction(payloadToSave))
    showSavedAlert()
  }




    return (

      <View>
      
      <ScrollView style={styles.scrollView}>
          <View style={styles.questionaireContainer}>
            {dataCapturePoints}
          </View>
      </ScrollView>

      <Button mode="contained" onPress={onSavePressed} 
          style={[styles.button]}>
          <Ionicons name="save" size={24} color="white" /> SAVE
      </Button>

      {showDatePicker && (

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: 'white' }}>
                <DateTimePicker mode="date" value={selectedDate} onChange={handleDateChange} />
            </View>
          </View>
      )}
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
    buttonDisabled: {
      backgroundColor: 'grey'
    },
})

  export default FormInitiator;