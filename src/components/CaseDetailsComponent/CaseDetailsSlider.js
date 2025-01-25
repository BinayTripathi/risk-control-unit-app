
import {useState} from "react";
import { StyleSheet, View, ScrollView, Dimensions, PixelRatio}  from 'react-native';

import CustomerDetails from "./CaseDetails/CustomerDetails";
import PolicyDetailsComponent from "./CaseDetails/PolicyDetails";
import BeneficiaryDetails from "./CaseDetails/BeneficiaryDetails";
import InvestigationDetails from './InvestigationDetails'
import SubmitInvestigation from "./SubmitInvestigation";

import {UPLOAD_TYPE} from '@core/constants'

const { width, height } = Dimensions.get('window');
export default function CaseDetailsSlider({selectedClaimId, selectedClaim, userId, investigatable}) {

    const [sliderState, setSliderState] = useState({ currentPage: 0 });
  
    const setSliderPage = (event) => {
      const { currentPage } = sliderState;
      const { x } = event.nativeEvent.contentOffset;
      const indexOfNextScreen = Math.floor(x / width);
      if (indexOfNextScreen !== currentPage) {
        setSliderState({
          ...sliderState,
          currentPage: indexOfNextScreen,
        });
      }
    };
  
    const { currentPage: pageIndex } = sliderState;

    return (
        <View style={{ flex: 1 }}>

            <ScrollView
            style={{ flex: 1 }}
            horizontal={true}
            scrollEventThrottle={16}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
                setSliderPage(event);
            }}
            >

            <View style={{ width, height }}>
                <PolicyDetailsComponent selectedClaim = {selectedClaim}/>
            </View>
            
            {selectedClaim?.policy.claimType !== "Death"  && <View style={{ width, height }}>
                <CustomerDetails selectedClaim = {selectedClaim}/>
            </View>}
            {selectedClaim?.policy.claimType === "Death" && <View style={{ width, height }}>
                <BeneficiaryDetails selectedClaim = {selectedClaim}/>
            </View>}

            {investigatable && <View style={{ width, height }}>
                <InvestigationDetails selectedClaimId = {selectedClaimId} userId = {userId} capability = {UPLOAD_TYPE.PHOTO}/>
            </View>  }          

            {investigatable && <View style={{ width, height }}>
                <InvestigationDetails selectedClaimId = {selectedClaimId} userId = {userId} capability = {UPLOAD_TYPE.DOCUMENT}/>
            </View>}
            
            {investigatable && <View style={{ width, height }}>
                <InvestigationDetails selectedClaimId = {selectedClaimId} userId = {userId} capability = {UPLOAD_TYPE.FORM}/>
            </View> }
            
            <View style={{ width, height }}>
                <SubmitInvestigation selectedClaimId = {selectedClaimId} userId = {userId}  selectedClaim = {selectedClaim}/>
            </View>
            
            </ScrollView>
            <View style={styles.paginationWrapper}>
            {Array.from(Array(investigatable? 6: 3).keys()).map((key, index) => (
                <View style={[styles.paginationDots, { opacity: pageIndex === index ? 1 : 0.2 }]} key={index} />
            ))}
            </View>
   </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    imageStyle: {
      height: PixelRatio.getPixelSizeForLayoutSize(135),
      width: '100%',
    },
  
      
    paginationWrapper: {
      position: 'absolute',
      //bottom: 20,
      top: height - 20,
      left: 0,
      right: 0,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    paginationDots: {
      height: 10,
      width: 10,
      borderRadius: 10 / 2,
      backgroundColor: '#e8500f',
      marginLeft: 10,
    },
  });