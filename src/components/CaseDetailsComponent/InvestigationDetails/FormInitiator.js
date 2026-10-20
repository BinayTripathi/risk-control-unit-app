import { StyleSheet,View, Text, TextInput, TouchableOpacity, Platform} from 'react-native';
import Checkbox from 'expo-checkbox';
import { useState, useRef } from "react";
import { useDispatch } from 'react-redux';
import { palette, radius, spacing } from '@core/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button";
import Button from '@components/UI/Button'
import SpeechToText, { mergeSpeechText } from '@components/UI/SpeechToText'
import { Ionicons } from '@expo/vector-icons';

import {requestUpdateFormCaseAction} from '@store/ducks/case-submission-slice'
import { UPLOAD_TYPE, questionsSubSection } from '@core/constants';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';


const FormInitiator = ({selectedClaimId, userId, caseUpdates, sectionFromTemplate}) => {

  //console.log('within form : ' + JSON.stringify(caseUpdates?.[sectionFromTemplate.locationName]?.[questionsSubSection]))
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

  // Speech results arrive asynchronously, so append against the latest answers rather than a stale closure
  const appendSpeechToAnswer = (question, heardText, prevText) => {
    setAnswers(prev => {
      const base = prev[question.questionText] ?? question
      const answerText = mergeSpeechText(base.answerText, heardText, prevText)
      return { ...prev, [question.questionText]: { ...base, answerText } }
    })
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

    if(question.isRequired && !answers?.[question.questionText]?.answerText) {
      mandatoryQuestionsListRef.current.add(question.questionText)    }
      
    const answerText = answers[question.questionText]?.answerText
    const options = question.options ? question.options.split(',').map(option => option.trim()).filter(Boolean) : []

    return( <View style={[styles.question, index === sectionFromTemplate.questions.length - 1 && styles.lastQuestion]} key={index}>
              <Text style={styles.questionText}>{question.questionText}{question.isRequired && <Text style={styles.required}> *</Text>}</Text>

              {question.questionType === 'multiText' && (
                <View style={styles.voiceRow}>
                  <TextInput
                    placeholder="Enter investigation comments"
                    placeholderTextColor={palette.muted}
                    onChangeText={(val) => handleInputChange(question, val)}
                    multiline={true}
                    numberOfLines={4}
                    keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password' }
                    style={[styles.input, styles.multiline, styles.voiceInput]}
                    value={answerText}/>
                  <SpeechToText style={styles.mic} getSpeechToTextResult={(heardText, prevText) => appendSpeechToAnswer(question, heardText, prevText)}/>
                </View>
              )}

              {question.questionType === 'text' && (
                <View style={styles.voiceRow}>
                  <TextInput
                    style={[styles.input, styles.voiceInput]}
                    placeholder="Type your answer"
                    placeholderTextColor={palette.muted}
                    value={answerText}
                    onChangeText={(val) => handleInputChange(question, val)} />
                  <SpeechToText style={styles.mic} getSpeechToTextResult={(heardText, prevText) => appendSpeechToAnswer(question, heardText, prevText)}/>
                </View>
              )}

              {question.questionType === 'date' && (
                <TouchableOpacity style={[styles.input, styles.dateInput]} onPress={() => openDatePicker(question)}>
                  <Text style={answerText ? styles.inputText : styles.placeholder}>
                    {answerText ? new Date(answerText).toLocaleDateString() : 'Select date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={palette.subText} />
                </TouchableOpacity>
              )}

              {(question.questionType === 'dropdown' || question.questionType === 'radio') && (
                <RadioButtonGroup
                  containerStyle={styles.optionGroup}
                  selected={answerText}
                  onSelected={(value) => handleInputChange(question, value)}
                  radioBackground={palette.primary}
                  radioStyle={styles.radio}
                  labelStyle={styles.optionLabel}
                  size={20}>
                    {options.map((option, i) => (
                      <RadioButtonItem key={i} value={option} label={option} />
                    ))}
                </RadioButtonGroup>
              )}

              {question.questionType === 'checkbox' && (
                <View style={styles.optionGroup}>
                  {options.map((option, i) => (
                    <View key={i} style={styles.checkboxRow}>
                      <Checkbox
                        color={palette.primary}
                        value={Array.isArray(answerText) && answerText.includes(option)}
                        onValueChange={(isChecked) => {
                          let updatedValues = Array.isArray(answerText) ? answerText : [];
                          updatedValues = isChecked
                            ? [...updatedValues, option]
                            : updatedValues.filter((val) => val !== option);
                          handleInputChange(question, updatedValues);
                        }}
                      />
                      <Text style={styles.optionLabel}>{option}</Text>
                    </View>
                  ))}
                </View>
              )}
      </View>)

  })


  const showSavedAlert = () => {
    Dialog.show({
    type: ALERT_TYPE.SUCCESS,
    title: 'Form Submission',
    textBody: 'Form Submitted Successfully',
    button: 'OK',          
    onHide: () => { }
  })
  }
  

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

    const payloadToSave = {
      caseId: selectedClaimId,
      section:  sectionFromTemplate.locationName,
      documentCategory : questionsSubSection,
      documentDetails: formDetailsForSubmission,
      id: Math.floor(1000 + Math.random() * 9000) * -1
    }

    dispatch(requestUpdateFormCaseAction(payloadToSave))
    showSavedAlert()
  }




    return (

      <View style={styles.container}>
        {dataCapturePoints}

        <Button mode="contained" onPress={onSavePressed} icon="content-save-outline" style={styles.button}>
          Save answers
        </Button>

      {showDatePicker && (
          <DateTimePicker mode="date" value={selectedDate} onChange={handleDateChange} />
      )}
    </View>

    )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: spacing.sm,
  },
  question: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  lastQuestion: {
    borderBottomWidth: 0,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: palette.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: palette.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: palette.text,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  voiceInput: {
    flex: 1,
  },
  mic: {
    flex: 0,
    backgroundColor: 'transparent',
    marginLeft: spacing.xs,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 15,
    color: palette.text,
  },
  placeholder: {
    fontSize: 15,
    color: palette.muted,
  },
  optionGroup: {
    gap: spacing.sm,
  },
  radio: {
    borderColor: palette.primary,
  },
  optionLabel: {
    fontSize: 14,
    color: palette.text,
    marginLeft: spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    marginTop: spacing.lg,
  },
})

  export default FormInitiator;