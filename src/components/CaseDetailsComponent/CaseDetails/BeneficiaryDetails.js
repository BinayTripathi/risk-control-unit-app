import { StyleSheet, ScrollView } from 'react-native';

import ProfileHeader from '@components/UI/ProfileHeader';
import InfoCard from '@components/UI/InfoCard';
import { spacing } from '@core/theme';


export default BeneficiaryDetailsComponent = ({selectedClaim}) => {

  if(selectedClaim === undefined)
    return null;

  let beneficiaryDetails = selectedClaim.beneficiary
  if(beneficiaryDetails === undefined)
    return null;

    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ProfileHeader
          overline="Beneficiary"
          name={beneficiaryDetails.name}
          subtitle={beneficiaryDetails.relation ? `Relation: ${beneficiaryDetails.relation}` : undefined}
          photoBase64={beneficiaryDetails.photo} />

        <InfoCard title="Beneficiary details" titleIcon="people" tone="orange" rows={[
          { label: 'Beneficiary ID', value: beneficiaryDetails.beneficiaryId, icon: 'id-card-outline' },
          { label: 'Date of birth', value: beneficiaryDetails.dateOfBirth, icon: 'calendar-outline' },
          { label: 'Phone', value: beneficiaryDetails.phone, icon: 'call-outline' },
          { label: 'Address', value: beneficiaryDetails.address, icon: 'location-outline' },
          { label: 'Annual income', value: beneficiaryDetails.income, icon: 'cash-outline' },
          { label: 'Relation', value: beneficiaryDetails.relation, icon: 'people-outline' },
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
