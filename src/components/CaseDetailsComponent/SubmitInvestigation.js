import { useState, useEffect } from "react";
import { View, Text , TextInput, StyleSheet, Dimensions , ScrollView, Platform} from "react-native"
import Checkbox from 'expo-checkbox';
import { FontAwesome } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Button from '@components/UI/Button'
import { SCREENS } from '@core/constants';
import {requestSubmitCaseAction} from '@store/ducks/case-submission-slice'
import { theme } from '@core/theme';
import useNetworkInfo from "../../hooks/useNetworkInfo";
import { DOC_TYPE } from '@core/constants';
import LoadingModalWrapper from '@components/UI/LoadingModal';
import { PaperProvider } from 'react-native-paper';

import SpeechToText from '@components/UI/SpeechToText'
import OkayCancelDialogBox from "@components/UI/OkayCancelDialogBox";
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';


const { width, height } = Dimensions.get('window');
const submitInvestigation = ({selectedClaimId, userId, selectedClaim}) => {
    
  let allCaseUpdates = useSelector((state) => state.casesUpdates.casesUpdates);
  let loading = useSelector((state) => state.casesUpdates.loading);
  let error = useSelector((state) => state.casesUpdates.error);
  const caseUpdates = allCaseUpdates[selectedClaimId]
  
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

    useEffect(()=>{
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
    },[loading, error, submitRequestDispatched])


    let docTypeList = [...DOC_TYPE.PHOTO_ID_SCANNER, ... DOC_TYPE.DOCUMENT_SCANNER, ...DOC_TYPE.FORM]

    let checkList = docTypeList.filter(dt => ('enabled' in dt) && dt['enabled'] === true)
                          .map(capability => {
                            let checkedTask = caseUpdates !== undefined && Object.keys(caseUpdates).includes(capability.name)
                            if(checkedTask === false) 
                              completeCheckList = false
                            return (
                              <View style={styles.checklistCheckboxContainer} key={capability.name}>
                                <Checkbox style={styles.checkbox} value={checkedTask}  />
                                <Text style={styles.label1}>{capability.name === 'FORM_TEMPLATE1' ? "Form Template" : capability.name}</Text>
                              </View>
                            )
                          } )

    const submitAlertBox = <OkayCancelDialogBox showDialog={showSubmitDialog} 
                                setShowDialog={setShowSubmitDialog}
                                title={'Submit Case'} 
                                content={(`Are you submitting the case now?.`)} 
                                okayHandler={ () => {
                                  let dataAvailable = caseUpdates !== undefined && caseUpdates['FORM_TEMPLATE1'] !== undefined                                  
                                  const payload = {
                                      claimId: selectedClaimId,  
                                      email: userId,
                                      beneficiaryId: selectedClaim.beneficiary.beneficiaryId,
                                      Question1:  dataAvailable == true? caseUpdates['FORM_TEMPLATE1'].question1 : '',
                                      Question2: dataAvailable == true? caseUpdates['FORM_TEMPLATE1'].question2: '',
                                      Question3: dataAvailable == true? caseUpdates['FORM_TEMPLATE1'].question3 : '',
                                      Question4: dataAvailable == true? caseUpdates['FORM_TEMPLATE1'].question4 : '',
                                      Remarks: remark
                                  }
                                  dispatch(requestSubmitCaseAction(payload))
                                  setTimeout(() => {
                                    setSubmitRequestDispatched(true)
                                  }, 500);                         
                                  

                                }} 
                                cancelHandler={ () => {} }/>

    return (
      <PaperProvider>
      <LoadingModalWrapper shouldModalBeVisible = {loading}>
      <View style={styles.container}>
        {submitAlertBox}
        <View style = {{marginTop: 40, marginBottom: 20}}>
          <Text style = {[styles.textBase, styles.description ]}>SUBMIT INVESTIGATION</Text>
        </View>

        <ScrollView style={styles.scrollView}>

            <View style={styles.checklistContainer}>
            <Text style={[styles.label, {textDecorationLine: 'underline'}]}>CHECKLIST:</Text>
              {checkList}
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                      placeholder="Enter investigation comments"
                      onChangeText={setRemark}
                      value={remark}
                      multiline={true}
                      numberOfLines={50}
                      keyboardType={
                      Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password' }
                      style={styles.input}  />
                      <SpeechToText getSpeechToTextResult= {setRemarksBySpeechToText}/>
            </View>     

            <View style={styles.checkboxContainer}>
              <Checkbox style={styles.checkbox} value={isTermsAccepted} onValueChange={setTermsAccepted} />
              <Text style={styles.label}>I agree to the Terms & Conditions</Text>
            </View>

            <View style={{flexDirection: 'row', marginTop: 20}}>
              <View style={{padding: 10}}>
                  <Button mode="elevated" style={[styles.button,!remark  || !isTermsAccepted || !isOnline || !completeCheckList? 
                  {backgroundColor: theme.colors.disabledSubmitButton} : {backgroundColor: theme.colors.submitButton}]} 
                              disabled={remark === null} onPress={() => {
                                  if (!remark  || !isTermsAccepted || !isOnline || !completeCheckList) 
                                    return
                                  
                                    setShowSubmitDialog(true)
                                  /*let dataAvailable = caseUpdates !== undefined && caseUpdates['FORM_TEMPLATE1'] !== undefined                                  
                                  const payload = {
                                      claimId: selectedClaimId,  
                                      email: userId,
                                      beneficiaryId: selectedClaim.beneficiary.beneficiaryId,
                                      Question1:  dataAvailable == true? caseUpdates['FORM_TEMPLATE1'].question1 : '',
                                      Question2: dataAvailable == true? caseUpdates['FORM_TEMPLATE1'].question2: '',
                                      Question3: dataAvailable == true? caseUpdates['FORM_TEMPLATE1'].question3 : '',
                                      Question4: dataAvailable == true? caseUpdates['FORM_TEMPLATE1'].question4 : '',
                                      Remarks: remark
                                  }
                                  dispatch(requestSubmitCaseAction(payload))
                                  navigation.navigate(SCREENS.CaseList)*/
                              }
                              }>
                              
                                <FontAwesome name="binoculars" size={20} color="white"/>
                                <Text style={{marginLeft: 2}}>SUBMIT</Text> 
                        
                              </Button>
              </View>

              <View style={{padding: 10}}>
                  <Button mode="elevated" style={[styles.button,!remark? {backgroundColor: 'grey'} : {backgroundColor: 'black'}]} 
                              disabled={remark === null} onPress={() => setRemark('')}><AntDesign name="delete" size={20} color="white" />RESET </Button>
              </View>
            </View>

          </ScrollView>

        
    </View>
    </LoadingModalWrapper>
    </PaperProvider>
    )
}

export default submitInvestigation

const styles = StyleSheet.create({
    container: {
      height: height,
      overflow: 'hidden',
      alignItems: "center",     
      paddingHorizontal: 20,
      padding: 50,
    },

    textBase: {
        color: 'black',
      },
      description: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#181818',
        fontSize: 28,
        fontWeight: 'bold',
        textShadowColor: 'rgba(22, 6, 96, 0.75)',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 20,
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

      checklistContainer : {
        marginTop: 5,
        width: '90%',
        backgroundColor: '#d1cbcb',
        opacity: 0.7,
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
        height: 160,
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
      checklistCheckboxContainer: {
        flexDirection: 'row',
      },
      checkbox: {
        margin: 8,
      },

      relationContainer : {
        flexDirection: 'row',
        marginVertical: 30,    
        paddingHorizontal: 5,
        alignItems: 'center',
        width: '95%',
        zIndex: 200,
      },
})