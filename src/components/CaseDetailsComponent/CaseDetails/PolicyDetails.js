import { useState } from 'react';
import { StyleSheet, View, ScrollView, Linking, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import CircularButton from '@components/UI/CircularButton';
import CustomDateTimePicker from '@components/UI/CustomDateTimePicker'
import SectionHeading from '@components/UI/SectionHeading';
import InfoCard from '@components/UI/InfoCard';

import { spacing, tones } from '@core/theme';
import { SECURE_AGENT_PHONE } from '@core/constants';
import { secureGet } from '@helpers/SecureStore';


export default PolicyDetailsComponent = ({selectedClaim, selectedClaimId}) => {

  const [appointmentTime, setAppointmentTime] = useState('');

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
    const callClient = async () => {
      if (!visitPerson?.phone) {
        Alert.alert('No phone number', `No phone number is available for the ${isClaim ? 'beneficiary' : 'life assured'}.`)
        return
      }
      const agentPhone = await secureGet(SECURE_AGENT_PHONE)
      if (!agentPhone) {
        Alert.alert('No agent number', 'Your phone number was not saved at registration. Please register this device again.')
        return
      }
      const params = {
        caseId: selectedClaimId,
        from: agentPhone,
        to: visitPerson.phone,
        key: process.env.EXPO_PUBLIC_DEMO_CALL_KEY,
      }
      fetch(process.env.EXPO_PUBLIC_DEMO_CALL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: Object.entries(params).map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join('&'),
      })
        .then((res) => {
          if (!res.ok) throw new Error(res.status)
          Alert.alert('Calling', 'You will receive a call shortly. Answer it to be connected.')
        })
        .catch(() => Alert.alert('Unable to call', 'The call could not be started. Please try again.'))
    }

      return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <SectionHeading overline="Policy" title={policy.policyNumber} subtitle={policy.claimType} icon="shield-checkmark" />

          <InfoCard title="Policy details" titleIcon="document-text" tone="indigo" rows={[
            { label: 'Policy number', value: policy.policyNumber, icon: 'document-text-outline' },
            { label: 'Claim type', value: policy.claimType, icon: 'pricetag-outline' },
            { label: 'Issue date', value: policy.issueDate, icon: 'calendar-outline' },
            { label: 'Incident date', value: policy.incidentDate, icon: 'alert-circle-outline' },
            { label: 'Reason', value: policy.reason, icon: 'information-circle-outline' },
            { label: 'Appointment', value: appointmentTime, icon: 'time-outline' },
          ]} />

          <View style={styles.actions}>
            <View style={styles.action}>
              <CustomDateTimePicker dateTimeInParent={appointmentTime} setDateTimeInParent = {setAppointmentTime} label={'Select Date And Time'}>
                <CircularButton label='Schedule visit' tone="violet"><Ionicons name="calendar" size={22} color={tones.violet.fg} /></CircularButton>
              </CustomDateTimePicker>
            </View>

            <View style={styles.action}>
              <CircularButton label='Get directions' tone="teal" onPress={openDirections}><Ionicons name="navigate" size={22} color={tones.teal.fg} /></CircularButton>
            </View>

            <View style={styles.action}>
              <CircularButton label={isClaim ? 'Call Beneficiary' : 'Call Life Assured'} tone="green" onPress={callClient}><Ionicons name="call" size={22} color={tones.green.fg} /></CircularButton>
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
