import React from "react";
import { Pressable, StyleSheet, Text, View, Image} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing, shadow, tones } from '@core/theme';
//import { selectCase } from "@store/ducks/case-slice";
import {isPointWithinRadius, getDistance} from 'geolib'
import { Dialog, ALERT_TYPE } from 'react-native-alert-notification';
import { GEOFENCING_RADIUS_IN_METRES } from "@core/constants";


function CaseItem({ caseDetails, userLocPromise, caseIndex }) {

  let dispatch = useDispatch();
  const navigation = useNavigation()

  const isClaim = !caseDetails.claimType || caseDetails.claimType == "Death"

  const handlePress = async () => {
    console.log('case item pressed')
    console.log("userLocPromise:", userLocPromise);

    let userLoc = await userLocPromise
    if (!userLoc) {
        console.error('Failed to fetch location');
        return; // Handle fallback logic here
    } else 
    {console.log(userLoc)
      console.log(caseDetails.coordinate)
    }

    console.log(getDistance({latitude: userLoc.coords.latitude, longitude: userLoc.coords.longitude},
      {latitude: caseDetails.coordinate.lat, longitude: caseDetails.coordinate.lng}))
    
    /*if(caseDetails && isPointWithinRadius({latitude: userLoc.coords.latitude, longitude: userLoc.coords.longitude},
       {latitude: caseDetails.coordinate.lat, longitude: caseDetails.coordinate.lng}, GEOFENCING_RADIUS_IN_METRES)) {*/
      navigation.navigate('CaseDetailsScreen', {
        claimId : caseDetails.claimId,
        investigatable: true
      })
    /*} else {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Geofencing alert',
        textBody: 'You cannot investigate the case from here',
        button: 'OK',          
        onHide: () => { 
          navigation.navigate('CaseDetailsScreen', {
            claimId : caseDetails.claimId,
            investigatable: false
          })
        }
      })
    }*/
    
   }

  const hasPhoto = !!caseDetails?.customerPhoto
  const initials = (caseDetails.customerName ?? '').trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('')

  const tone = isClaim ? tones.amber : tones.sky

  return (
    <Pressable onPress={() =>handlePress()} style={({ pressed }) => [styles.card, { borderLeftColor: tone.fg }, pressed && styles.pressed]}>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.avatarRing, { borderColor: tone.fg }]}>
            {hasPhoto
              ? <Image style={styles.avatar} source={{uri: `data:image/*;base64,${caseDetails.customerPhoto}`}}/>
              : <View style={[styles.avatar, { backgroundColor: tone.bg }]}><Text style={[styles.avatarText, { color: tone.fg }]}>{initials}</Text></View>}
          </View>

          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={1}>{caseDetails.customerName}</Text>
            {!!caseDetails.district && (
              <View style={styles.districtRow}>
                <Ionicons name="location" size={14} color={tones.rose.fg} />
                <Text style={styles.district} numberOfLines={1}>{caseDetails.district}</Text>
              </View>
            )}
          </View>

          <View style={[styles.typeChip, { backgroundColor: tone.bg }]}>
            <Ionicons name={isClaim ? 'medkit' : 'shield-checkmark'} size={12} color={tone.fg} />
            <Text style={[styles.typeChipText, { color: tone.fg }]}>{isClaim ? 'CLAIM' : 'RCU'}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.metaIcon, { backgroundColor: palette.divider }]}>
            <Ionicons name="document-text" size={16} color={palette.subText} />
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Policy number</Text>
            <Text style={styles.metaValue} numberOfLines={1}>{caseDetails.policyNumber}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Case code</Text>
            <Text style={[styles.metaValue, { color: tone.fg }]} numberOfLines={1}>{caseDetails.code}</Text>
          </View>
          <View style={[styles.go, { backgroundColor: tone.fg }]}>
            <Ionicons name="arrow-forward" size={18} color={palette.onPrimary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default CaseItem;

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 5,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadow.soft,
  },
  pressed: {
    opacity: 0.85,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  body: {
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    padding: 2,
    borderWidth: 2,
    borderRadius: 28,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.divider,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '700',
  },
  nameBlock: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.text,
  },
  districtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  district: {
    marginLeft: 4,
    fontSize: 14,
    color: palette.subText,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceAlt,
  },
  metaIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: palette.subText,
    marginBottom: 1,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.text,
  },
  go: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
