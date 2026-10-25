import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Linking, Alert, AppState } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import CircularButton from '@components/UI/CircularButton';
import CustomDateTimePicker from '@components/UI/CustomDateTimePicker'
import SectionHeading from '@components/UI/SectionHeading';
import InfoCard from '@components/UI/InfoCard';

import { spacing, tones } from '@core/theme';
import { SECURE_AGENT_PHONE } from '@core/constants';
import { secureGet, secureSave } from '@helpers/SecureStore';
import { toDisplayDateTime } from '@helpers/date';
import { sendSchedule, getSchedule } from '@services/RestServiceCalls';


export default PolicyDetailsComponent = ({selectedClaim, selectedClaimId}) => {

  const [requestedAt, setRequestedAt] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  // shortcut: get-schedule returns a date only once scheduled, so the requested time lives on this phone (lost on reinstall or another device); drop it once get-schedule also returns the requested time
  const scheduleKey = `schedule_${selectedClaimId}`

  const loadSchedule = () => {
    secureGet(scheduleKey).then(setRequestedAt)
    // Response: { scheduled: boolean, scheduleDate?: "dd/MM/yyyy HH:mm" }
    getSchedule(selectedClaimId)
      .then((res) => {
        setIsAccepted(res.data?.scheduled === true)
        setScheduledAt(res.data?.scheduleDate ?? null)
      })
      .catch((err) => console.log('getSchedule error:', err))
  }

  useEffect(() => {
    if (selectedClaimId) loadSchedule()
  }, [selectedClaimId])

    if(selectedClaim === undefined)
      return null;

    let policy = selectedClaim.policy
    if(policy === undefined)
      return null;

    // Claims visit the beneficiary; underwriting visits the life assured (customer)
    const isClaim = policy.claimType === "Death"
    const visitPerson = isClaim ? selectedClaim.beneficiary : selectedClaim.customer
    const visitAddress = visitPerson?.address

    // Opens Google Maps (app if installed, otherwise browser) with directions from the agent's current location
    const openDirections = () => {
      if (!visitAddress) {
        Alert.alert('No address', `No address is available for the ${isClaim ? 'beneficiary' : 'life assured'}.`)
        return
      }
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(visitAddress)}&travelmode=driving`
      Linking.openURL(url).catch(() => Alert.alert('Unable to open maps', 'Please check a maps app or browser is installed.'))
    }

    // Bridged call: the server rings the agent, then the client, and both see only the Twilio number.
    // shortcut: demo sends both phones and a shared key from the app; for production the backend looks up both numbers from the agent's token
    const visitPersonTitle = isClaim ? 'beneficiary' : 'life assured'
    const showDialog = (type, title, textBody) => Dialog.show({ type, title, textBody, button: 'OK' })

    const callClient = async () => {
      const { callURL, callKey } = Constants.expoConfig?.extra?.twilio ?? {}
      if (!callURL || !callKey) {
        showDialog(ALERT_TYPE.WARNING, 'Calling unavailable', 'Calling is not set up in this build of the app.')
        return
      }
      if (!visitPerson?.phone) {
        showDialog(ALERT_TYPE.WARNING, 'No phone number', `There is no phone number on file for the ${visitPersonTitle}.`)
        return
      }
      const agentPhone = await secureGet(SECURE_AGENT_PHONE)
      if (!agentPhone) {
        showDialog(ALERT_TYPE.WARNING, 'Your number is missing', 'Your phone number was not saved at registration. Please register this device again.')
        return
      }
      setIsCalling(true)
      const params = {
        caseId: selectedClaimId,
        from: agentPhone,
        to: visitPerson.phone,
        key: callKey,
      }
      fetch(callURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: Object.entries(params).map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join('&'),
      })
        .then((res) => {
          if (!res.ok) throw new Error(res.status)
          // The incoming-call screen sends the app to the background; close then, or after 8s if the call shows only as a banner
          const appStateSubscription = AppState.addEventListener('change', (state) => {
            if (state !== 'active') Dialog.hide()
          })
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Calling you now',
            textBody: `Answer the incoming call and you will be connected to the ${visitPersonTitle}.`,
            button: 'OK',
            autoClose: 8000,
            onHide: () => appStateSubscription.remove(),
          })
        })
        .catch(() => showDialog(ALERT_TYPE.DANGER, 'Call not started', "We couldn't start the call. Check your connection and try again."))
        .finally(() => setIsCalling(false))
    }

    const requestSchedule = (dateTime) => {
      const iso = dateTime.toISOString()
      sendSchedule(selectedClaimId, iso)
        .then(async () => {
          showDialog(ALERT_TYPE.SUCCESS, 'Visit requested', `Requested for ${toDisplayDateTime(dateTime)}.`)
          await secureSave(scheduleKey, iso)
          loadSchedule()
        })
        .catch(() => showDialog(ALERT_TYPE.DANGER, 'Visit not requested', "We couldn't send the schedule. Check your connection and try again."))
    }

    const scheduleStatus = {
      icon: 'calendar-outline',
      tone: 'violet',
      trailing: isAccepted
        ? <Ionicons name="checkmark-circle" size={24} color={tones.green.fg} accessibilityLabel="Confirmed" />
        : <Ionicons name="hourglass-outline" size={22} color={tones.amber.fg} accessibilityLabel="Awaiting confirmation" />,
    }
    const appointmentRow = isAccepted
      ? { label: 'Scheduled', value: scheduledAt ?? 'Confirmed', ...scheduleStatus }
      : { label: 'Requested · awaiting confirmation', value: requestedAt ? toDisplayDateTime(new Date(requestedAt)) : '', ...scheduleStatus }

      return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <SectionHeading overline="Policy" title={policy.policyNumber} subtitle={policy.claimType} icon="shield-checkmark" />

          <InfoCard title="Policy details" titleIcon="document-text" tone="indigo" rows={[
            { label: 'Policy number', value: policy.policyNumber, icon: 'document-text-outline' },
            { label: 'Claim type', value: policy.claimType, icon: 'pricetag-outline' },
            { label: 'Issue date', value: policy.issueDate, icon: 'calendar-outline' },
            { label: 'Incident date', value: policy.incidentDate, icon: 'alert-circle-outline' },
            { label: 'Reason', value: policy.reason, icon: 'information-circle-outline' },
            appointmentRow,
          ]} />

          <View style={styles.actions}>
            <View style={styles.action}>
              <CustomDateTimePicker dateTimeInParent={appointmentRow.value} setDateTimeInParent = {requestSchedule} label={'Select Date And Time'}>
                <CircularButton label={isAccepted ? 'Reschedule visit' : 'Schedule visit'} tone="violet"><Ionicons name="calendar" size={22} color={tones.violet.fg} /></CircularButton>
              </CustomDateTimePicker>
            </View>

            <View style={styles.action}>
              <CircularButton label='Get directions' tone="teal" onPress={openDirections}><Ionicons name="navigate" size={22} color={tones.teal.fg} /></CircularButton>
            </View>

            <View style={styles.action}>
              <CircularButton label={isClaim ? 'Talk to Beneficiary' : 'Talk to Life Assured'} tone="green" onPress={callClient} disabled={isCalling}><Ionicons name="call" size={22} color={tones.green.fg} /></CircularButton>
            </View>
          </View>
        </ScrollView>
      )
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
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: spacing.md,
      gap: spacing.md,
    },
    action: {
      flexGrow: 1,
      flexBasis: '40%',
    },
})
