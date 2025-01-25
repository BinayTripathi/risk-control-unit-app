import Background from "@components/UI/Background";
import CaseDetails from "@components/CaseDetailsComponent/CaseDetails";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { useDispatch, useSelector } from 'react-redux';
import {secureGet} from '@helpers/SecureStore'
import {SECURE_USER_KEY} from '@core/constants'


import { requestCaseDetails } from '@store/ducks/case-details-slice'


export default function CaseDetailsScreen({navigation, route}) {

  const dispatch = useDispatch()
  const claimId = route.params.claimId;
  const investigatable = route.params.investigatable;
  const [userId, setUserId] = useState(null)
  //const userId = useSelector(state => state.user.userId)
  

  useEffect(() => {     
      console.log('Fetching details')  


      const fetchDetails = async() => {
        const email = await secureGet(SECURE_USER_KEY)    
        setUserId(email)
        const payload = {
            "userId" : email,
             "claimId": claimId
        }
        
        dispatch(requestCaseDetails(payload))  

      }
      
      
      fetchDetails()
      
  }, [dispatch])


return (
    <Background style={{ flex: 1 }}>
        <CaseDetails claimId = {claimId} userId={userId} investigatable={investigatable}/>       
   </Background>  
  );
}

