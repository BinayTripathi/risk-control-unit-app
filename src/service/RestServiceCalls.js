import Constanst from 'expo-constants'
import * as Request from '../helpers/serviceApi'
import * as Application from 'expo-application';
import { Platform } from 'expo-modules-core';
import { Image } from "react-native";
import axios from 'axios';
import curlirize from "axios-curlirize";
//const BASE_URL = 'https://rcu.azurewebsites.net/api';
//const BASE_URL = 'https://ccutest.free.beeceptor.com'
//const BASE_URL = 'https://holosync.azurewebsites.net/api'

//let  BASE_URL =  'https://icheckify.azurewebsites.net/api'
//const BASE_URL =  'https://chek.azurewebsites.net/api'
const BASE_URL = Constanst?.expoConfig?.extra?.baseURL
curlirize(axios);

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "*/*",
    "Content-Type": "multipart/form-data"
  }
});


// Add request interceptor to log request before it goes
apiClient.interceptors.request.use((config) => {
  console.log("Request Sent:", {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data // Logs FormData if included
  });
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }
  return config;
});

const verifyLogin =  async (emailId) => {
   
    const url = `https://my-json-server.typicode.com/BinayTripathi/demo/authenticate`   
    console.log(url) 
    let resp = await Request.get({url});
}

export const userRegister = async (phoneNo, deviceId) => {
  try {  
    const url = `${BASE_URL}/Agent/VerifyMobile`
    console.log(url)
    const config = {}
    const data = {
      "mobile" : phoneNo,
      "uid" : deviceId,
      "checkUid" : true,
      "sendSMS": true
    };
    console.log("-----------"+JSON.stringify(data))
    let response = await  Request.post({url, config, data});    
    return response
   
  } catch (error) {
    console.log('EXCEPTION')
    console.log(JSON.stringify(error.message)); // this is the main part. Use the response property from the error object
    throw JSON.stringify(error);
  }
}


export const userRegisterPhoto = async (image, iosDeviceId) => {

  let deviceId = ''
  if (Platform.OS === 'android') 
    deviceId = Application.getAndroidId()
  try {  
    const url = `${BASE_URL}/Agent/VerifyId`
    console.log(url)
    const config = {}
    const data = {
      "image": image,
      "uid": deviceId,
      "verifyId": true
    }
    
    let response = await  Request.post({url, config, data});
    return response
   
  } catch (error) {
    console.log('EXCEPTION')
    console.log(JSON.stringify(error.message)); // this is the main part. Use the response property from the error object
    throw JSON.stringify(error);
  }
}

export const userLogin = async (emailId) => {
  try {   
      const url = `${BASE_URL}/agent/agent?email=${emailId}`
      console.log(url)
      let response = await Request.get({url});
      return response
   
  } catch (error) {
    console.log(JSON.stringify(error)); // this is the main part. Use the response property from the error object
    throw JSON.stringify(error);
  }
}

export const getAllCases = async (email) => {

  try {
    //const url = `https://my-json-server.typicode.com/BinayTripathi/demo/CASE_LIST`
    const url = `${BASE_URL}/agent/agent?email=${email}`
    //const url = 'https://ccutest.free.beeceptor.com/agents'
    //const url = 'https://rcu.azurewebsites.net/api/agent/agent?email=agent@agency1.com'
    console.log(url)
    let response = await Request.get({url});
    //console.log(response)
    return response
  } catch (error) {
    console.log(JSON.stringify(error.message)); // this is the main part. Use the response property from the error object
    throw JSON.stringify(error.message);
  }
}


export const getAllCaseCoordinates = async (email) => {

  try {
    const url = `${BASE_URL}/agent/agent-map?email=${email}`
    console.log(url)
    let response = await Request.get({url});
    return response
  } catch (error) {
    console.log(JSON.stringify(error.message)); // this is the main part. Use the response property from the error object
    throw JSON.stringify(error.message);
  }
}

export const getCaseDetails = async (email, claim) => {
  try {
  const url = `${BASE_URL}/agent/get?email=${email}&caseId=${claim}`
  //const url = 'https://rcu.azurewebsites.net/api/agent/get?email=agent@agency1.com&claimid=1da83e41-12e5-4827-87c1-0d7a0fc7ab38'
  //const url = 'https://ccutest.free.beeceptor.com/details'
  console.log(url)
  let response = await  Request.get({url}); 
  return response
  }  catch (error) {
    console.log(JSON.stringify(error.message)); // this is the main part. Use the response property from the error object
    throw JSON.stringify(error.message);
  }
}





export const updateCaseDocument = async (body) => {
  console.log('Update case API being called')
  try {
      const url = `${BASE_URL}/agent/documentid`;
      //const url = `https://ccutest.free.beeceptor.com/update`
      const config = {}
      const data = {
        ...body
      };
      let response = await  Request.post({url, config, data});
      return response
    }  catch (error) {
      console.log(JSON.stringify(error.message)); // this is the main part. Use the response property from the error object
      throw JSON.stringify(error.message);
    }
  };


export const updateCaseFace = async ({email, claimId, sectionName, investigationName, LocationLongLat, locationImage}) => {
  try {
    
    
      //const email = "agent@verify.com";
      const caseId = "1";
      const locationName = "VERIFIER_ADDRESS";
      const reportName = "AGENT_FACE";
      //const locationLatLong = "-35/125";

    const API_URL = `${BASE_URL}/Agent/faceid`;    
    const urlWithParams = `${API_URL}?Email=${encodeURIComponent(email)}&CaseId=${encodeURIComponent(caseId)}&LocationName=${encodeURIComponent(locationName)}&ReportName=${encodeURIComponent(reportName)}&LocationLatLong=${encodeURIComponent(LocationLongLat)}`;
    //const urlWithParams = `https://icheckify-demo.azurewebsites.net/api/Agent/faceid?Email=agent%40verify.com&CaseId=1&LocationName=location&ReportName=report&LocationLatLong=-35%2F125`
    console.log(urlWithParams)
    
    const formData = new FormData();
    formData.append("Image", {
      uri: locationImage,
      type: "image/jpeg",
      name: 'image.jpg'
    });

    
    const response = await axios({
      method: "post",
      url: urlWithParams,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
     /* .then(function (response) {
        console.log("SUCCESS")
        console.log(response);
      })
      .catch(function (response) {
        console.log("FAILED")
        console.log(response);
      });*/



    console.log("Upload Success:", response.data);
    return response.data;
  } catch (error) {
    console.error("Upload Failed:", error.response?.data || error.message);
    throw error;
  }
};

  export const updateCaseFace1 = async (body) => {
    body.OcrData=""
    console.log('Update case API being called')
    
    try {
        const url = `${BASE_URL}/agent/faceid`;
        //const url = `https://ccutest.free.beeceptor.com/update`
        const config = {}
        const data = {
          ...body
        };
        console.log(url)
        let response = await  Request.post({url, config, data});
        return response
      }  catch (error) {
        console.log(JSON.stringify(error.message)); // this is the main part. Use the response property from the error object
        throw JSON.stringify(error.message);
      }
    };

  export const submitCase = async (body) => {
    console.log(JSON.stringify(body))
    try {
        const url = `${BASE_URL}/agent/submit`;
        //const url = `https://my-json-server.typicode.com/BinayTripathi/demo/authenticate`  
        const config = {}
        const data = {
          ...body
        };
        console.log(url)
        console.log(JSON.stringify(data))
        
        let response = await  Request.post({url, config, data});
        return response
      }  catch (error) {
        console.log(JSON.stringify(error.message)); // this is the main part. Use the response property from the error object
        throw JSON.stringify(error.message);
      }
    };
  