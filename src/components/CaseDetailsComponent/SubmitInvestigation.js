import { useState, useEffect } from "react";
import { View, Text , TextInput, StyleSheet, ScrollView, Platform, Pressable} from "react-native"
import Checkbox from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Button from '@components/UI/Button'
import { SCREENS } from '@core/constants';
import {requestSubmitCaseAction} from '@store/ducks/case-submission-slice'
import { theme, palette, radius, spacing, shadow, typography } from '@core/theme';
import SectionHeading from '@components/UI/SectionHeading';
import useNetworkInfo from "../../hooks/useNetworkInfo";
import { DOC_TYPE } from '@core/constants';
import LoadingModalWrapper from '@components/UI/LoadingModal';
import { PaperProvider } from 'react-native-paper';

import SpeechToText from '@components/UI/SpeechToText'
import OkayCancelDialogBox from "@components/UI/OkayCancelDialogBox";
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';


const submitInvestigation = ({selectedClaimId, userId, selectedClaim}) => {
    
  let allCaseUpdates = useSelector((state) => state.casesUpdates.casesUpdates);
  let loading = useSelector((state) => state.casesUpdates.loading);
  let error = useSelector((state) => state.casesUpdates.error);
  const caseUpdates = allCaseUpdates[selectedClaimId]

  //console.log('Updates in sbmit' + JSON.stringify(caseUpdates))
  
    const [remark, setRemark] = useState(null);
    const [isTermsAccepted, setTermsAccepted] = useState(false);
    const navigation = useNavigation()
    const dispatch = useDispatch()
    const [isOnline] = useNetworkInfo();

    const [showSubmitDialog, setShowSubmitDialog] = useState(false)
    const [submitRequestDispatched, setSubmitRequestDispatched] = useState(false)
    
    let completeCheckList = true

    let setRemarksBySpeechToText = (heardText) => {
       console.log(remark)
      setRemark(remark => remark !== null ?  remark +". " + heardText : heardText)
    }

    /*useEffect(()=>{
      if (submitRequestDispatched) {
        if(error) {
          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: 'Submission Failed',
            textBody: 'Please try again',
            button: 'OK',          
            onHide: () => { 
              setSubmitRequestDispatched(false)              
              navigation.navigate(SCREENS.CaseList)
            }
          })
        } else if(!loading) {
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Case submission',
            textBody: 'Congratulations! Case submission successful.',
            button: 'OK',          
            onHide: () => { 
              setSubmitRequestDispatched(false)
              navigation.navigate(SCREENS.CaseList)
            }
          })          
        }        
      }
    },[loading, error, submitRequestDispatched])*/

    useEffect(() => {
      // Only run this after a submission was triggered
      if (!submitRequestDispatched) return;

      // When loading is done
      if (!loading) {
        if (error) {
          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: 'Submission Failed',
            textBody: 'Please try again',
            button: 'OK',
            onHide: () => {
              setSubmitRequestDispatched(false);
              navigation.navigate(SCREENS.CaseList);
            }
          });
        } else {
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Case Submission',
            textBody: 'Congratulations! Case submission successful.',
            button: 'OK',
            onHide: () => {
              setSubmitRequestDispatched(false);
              navigation.navigate(SCREENS.CaseList);
            }
          });
        }
      }
    }, [loading, error, submitRequestDispatched]);



    let checkList = caseUpdates !== undefined ? Object.entries(caseUpdates).map(([key, value]) => {
          let checkedTask = value.completed.faceIds  && value.completed.documentId && value.completed.questions 
          if(checkedTask === false && value.isRequired === true ) 
            completeCheckList = false

          return (
            <View style={styles.checklistRow} key={key}>
              <Ionicons
                name={checkedTask ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={checkedTask ? palette.success : palette.muted} />
              <Text style={styles.checklistText}>{key}{value.isRequired && <Text style={styles.required}> *</Text>}</Text>
              <Text style={[styles.checklistStatus, checkedTask && styles.checklistStatusDone]}>{checkedTask ? 'Complete' : 'Incomplete'}</Text>
            </View>
          )
        } ) : false

    const submitAlertBox = <OkayCancelDialogBox showDialog={showSubmitDialog} 
                                setShowDialog={setShowSubmitDialog}
                                title={'Submit Case'} 
                                content={(`Are you submitting the case now?.`)} 
                                okayHandler={ () => {                                
                                  const payload = {
                                      email: userId,
                                      caseId: selectedClaimId, 
                                      remarks: remark
                                  }
                                  dispatch(requestSubmitCaseAction(payload))
                                  setSubmitRequestDispatched(true)
                                }} 
                                cancelHandler={ () => {} }/>

    const canSubmit = !!remark && isTermsAccepted && isOnline

    return (
      <PaperProvider theme={theme}>
      <LoadingModalWrapper shouldModalBeVisible = {loading}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {submitAlertBox}
        <SectionHeading overline="Final step" title="Submit investigation" subtitle="Review the checklist, add your remarks and submit." />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Checklist</Text>
          {checkList}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Investigation remarks</Text>
          <View style={styles.remarksBox}>
            <TextInput
                    placeholder="Enter investigation comments"
                    placeholderTextColor={palette.muted}
                    onChangeText={setRemark}
                    value={remark}
                    multiline={true}
                    numberOfLines={6}
                    keyboardType={
                    Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password' }
                    style={styles.input}  />
            <SpeechToText getSpeechToTextResult= {setRemarksBySpeechToText}/>
          </View>
        </View>

        <Pressable style={styles.termsRow} onPress={() => setTermsAccepted(!isTermsAccepted)}>
          <Checkbox color={palette.primary} value={isTermsAccepted} onValueChange={setTermsAccepted} />
          <Text style={styles.termsText}>I confirm the information captured is accurate and agree to the Terms & Conditions</Text>
        </Pressable>

        {!completeCheckList && <Text style={styles.hint}>Some required locations are incomplete.</Text>}
        {!isOnline && <Text style={styles.hint}>You are offline. Connect to the internet to submit.</Text>}

        <Button mode="contained" icon="send" disabled={!canSubmit}
                onPress={() => {
                    if (!remark  || !isTermsAccepted || !isOnline)
                      return
                    setShowSubmitDialog(true)
                }}>
          Submit case
        </Button>
        <Button mode="outlined" variant="secondary" icon="eraser" disabled={!remark} onPress={() => setRemark('')}>
          Clear remarks
        </Button>

      </ScrollView>
    </LoadingModalWrapper>
    </PaperProvider>
    )
}

export default submitInvestigation

const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
      width: '100%',
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl * 2,
    },
    card: {
      backgroundColor: palette.surface,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.border,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadow.card,
    },
    cardTitle: {
      ...typography.label,
      marginBottom: spacing.sm,
    },
    checklistRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    checklistText: {
      flex: 1,
      marginLeft: spacing.md,
      fontSize: 15,
      fontWeight: '500',
      color: palette.text,
    },
    checklistStatus: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.muted,
    },
    checklistStatusDone: {
      color: palette.success,
    },
    required: {
      color: palette.danger,
    },
    remarksBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: radius.md,
      backgroundColor: palette.surfaceAlt,
      paddingRight: spacing.sm,
    },
    input: {
      flex: 1,
      minHeight: 120,
      padding: spacing.md,
      fontSize: 15,
      color: palette.text,
      textAlignVertical: 'top',
    },
    termsRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginVertical: spacing.md,
    },
    termsText: {
      flex: 1,
      marginLeft: spacing.md,
      fontSize: 14,
      lineHeight: 20,
      color: palette.subText,
    },
    hint: {
      fontSize: 13,
      color: palette.warning,
      marginBottom: spacing.sm,
    },
})
