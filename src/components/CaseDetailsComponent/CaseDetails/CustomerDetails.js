import { StyleSheet, ScrollView } from 'react-native';

import ProfileHeader from '@components/UI/ProfileHeader';
import InfoCard from '@components/UI/InfoCard';
import { spacing } from '@core/theme';


export default CustomerDetailsComponent = ({selectedClaim}) => {

    if(selectedClaim === undefined)
      return null;
    let customerDetails = selectedClaim.customer
    if(customerDetails === undefined)
      return null;

    let policy = selectedClaim.policy
    if(policy === undefined)
      return null;

      return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <ProfileHeader
            overline="Customer"
            name={customerDetails.name}
            subtitle={customerDetails.occupation}
            photoBase64={customerDetails.photo} />

          <InfoCard title="Customer details" titleIcon="person" tone="orange" rows={[
            { label: 'Policy number', value: policy.policyNumber, icon: 'document-text-outline' },
            { label: 'Date of birth', value: customerDetails.dateOfBirth, icon: 'calendar-outline' },
            { label: 'Phone', value: customerDetails.phone, icon: 'call-outline' },
            { label: 'Address', value: customerDetails.address, icon: 'location-outline' },
            { label: 'Occupation', value: customerDetails.occupation, icon: 'briefcase-outline' },
            { label: 'Annual income', value: customerDetails.income, icon: 'cash-outline' },
          ]} />
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
  })
