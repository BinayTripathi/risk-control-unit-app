import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import CircularButton from '@components/UI/CircularButton';
import CustomDateTimePicker from '@components/UI/CustomDateTimePicker'
import SectionHeading from '@components/UI/SectionHeading';
import InfoCard from '@components/UI/InfoCard';

import { palette, spacing } from '@core/theme';


export default PolicyDetailsComponent = ({selectedClaim}) => {

  const [appointmentTime, setAppointmentTime] = useState('');

    if(selectedClaim === undefined)
      return null;

    let policy = selectedClaim.policy
    if(policy === undefined)
      return null;

      return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <SectionHeading overline="Policy" title={policy.policyNumber} subtitle={policy.claimType} />

          <InfoCard title="Policy details" rows={[
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
                <CircularButton label='Schedule visit'><Ionicons name="calendar-outline" size={22} color={palette.accent} /></CircularButton>
              </CustomDateTimePicker>
            </View>

            <View style={styles.action}>
              <CircularButton label='Get directions'><Ionicons name="navigate-outline" size={22} color={palette.accent} /></CircularButton>
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
      marginTop: spacing.md,
      gap: spacing.md,
    },
    action: {
      flex: 1,
    },
})
