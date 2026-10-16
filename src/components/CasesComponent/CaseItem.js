import React from "react";
import { Pressable, StyleSheet, Text, View, Image} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing, shadow } from '@core/theme';
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

  return (
    <Pressable onPress={() =>handlePress()} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.accent, { backgroundColor: isClaim ? palette.accent : palette.primary }]} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          {hasPhoto
            ? <Image style={styles.avatar} source={{uri: `data:image/*;base64,${caseDetails.customerPhoto}`}}/>
            : <View style={[styles.avatar, styles.avatarFallback]}><Text style={styles.avatarText}>{initials}</Text></View>}

          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={1}>{caseDetails.customerName}</Text>
            {!!caseDetails.district && (
              <View style={styles.districtRow}>
                <Ionicons name="location-outline" size={13} color={palette.subText} />
                <Text style={styles.district} numberOfLines={1}>{caseDetails.district}</Text>
              </View>
            )}
          </View>

          <View style={[styles.typeChip, { backgroundColor: isClaim ? palette.accentTint : palette.primaryTint }]}>
            <Text style={[styles.typeChipText, { color: isClaim ? palette.accent : palette.primary }]}>{isClaim ? 'CLAIM' : 'RCU'}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Policy number</Text>
            <Text style={styles.metaValue} numberOfLines={1}>{caseDetails.policyNumber}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Case code</Text>
            <Text style={styles.metaValue} numberOfLines={1}>{caseDetails.code}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={palette.muted} />
        </View>
      </View>
    </Pressable>
  );
}

export default CaseItem;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadow.card,
  },
  pressed: {
    opacity: 0.8,
  },
  accent: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.divider,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primaryTint,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.primary,
  },
  nameBlock: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  districtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  district: {
    marginLeft: 3,
    fontSize: 13,
    color: palette.subText,
  },
  typeChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  typeChipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: palette.muted,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
  },
});
