import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet,Text,TouchableOpacity, View, Image, Alert, Dimensions, Button} from "react-native";
import { actuatedNormalize, actuatedNormalizeVertical, isTab } from "@core/PixelScaling";
import { MaterialCommunityIcons , Ionicons, Entypo } from '@expo/vector-icons';
import { useDispatch} from 'react-redux'
import { useNavigation } from "@react-navigation/native";
import { Video } from 'expo-av';

import { VIDEO_FORMAT } from '@core/constants';
import useLocationTracker from "@hooks/useLocationTracker";
import LoadingModalWrapper from '@components/UI/LoadingModal';

import {requestUpdateAudioVideoCaseAction} from '@store/ducks/case-submission-slice'

const cameraMarginTop = 90

export const VideoPreview = ({photoData, setPhotoData, claimId, docType, email, sectionName,
  investigationName, isLastMandatory}) => { 

    const loading = undefined

    const navigation = useNavigation();
    const dispatch = useDispatch()

    const video = useRef(null);
    const [status, setStatus] = useState({});

    const tracker = useLocationTracker()
    let savedPhoto = useRef(null);


    const uploadVideo = () => {
          const mediaDetails = {
                 email : email,
                 caseId: claimId,            
                 docType: docType.type,
                 capability: docType.name,
                 sectionName,
                 investigationName,
                 isLastMandatory,
                 mediaPath: photoData,
                 LocationLongLat : '-45/128'
               }
               
               const payloadToSave = {
                 caseId: claimId,
                 section : mediaDetails.sectionName,
                 documentCategory: 'mediaReports',
                 documentName: mediaDetails.investigationName,
                 documentDetails :  mediaDetails,
                 id: Math.floor(1000 + Math.random() * 9000) * -1
               }
               console.log(payloadToSave)
               //setSavePayload(payloadToSave)
               //setShowSaveDialog(true)
               dispatch(requestUpdateAudioVideoCaseAction(payloadToSave))
          //dispatch(requestAddVideoAction(addVideoPayload))
          console.log('Video upload')
          navigation.goBack()   
    }

    const playVideo = <TouchableOpacity  onPress={() =>  status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()} 
        style={styles.button}>
            <View style={styles.buttonInside}>
                {!status.isPlaying && <Ionicons name="play" size={50} color="blue" />}
                {status.isPlaying && <MaterialCommunityIcons name="pause" size={50} color="green" />}
            </View>          
    </TouchableOpacity>

    const uploadVideoBt = <TouchableOpacity  onPress={uploadVideo} 
    style={styles.button}>
        <View style={styles.buttonInside}>
            <Entypo name="upload-to-cloud" size={45} color="blue" />
        </View>          
    </TouchableOpacity>


    const retakeVideoBt = <TouchableOpacity  onPress={() => setPhotoData(null)} 
    style={styles.button}>
        <View style={styles.buttonInside}>
            <MaterialCommunityIcons name="camera-retake" size={50} color="blue" />
        </View>          
    </TouchableOpacity>






    return(

        <LoadingModalWrapper shouldModalBeVisible = {loading === undefined ? false: loading}>
            <View style={styles.container}>


                <Video ref={video} style={styles.video}  source={{ uri: photoData, }}  useNativeControls  resizeMode="contain"
                        isLooping ={false}  onPlaybackStatusUpdate={status => setStatus(() => status)} />

                <View style={styles.buttons}>
                        {playVideo}

                        {uploadVideoBt}

                        {retakeVideoBt}
                </View>

            </View>
         </LoadingModalWrapper>

        

    )


   }


   const styles = StyleSheet.create({

    container: {
        flex: 1, 
        marginTop: actuatedNormalizeVertical(cameraMarginTop),
        alignItems: 'center',
    },
    cameraContainer: {
        flexDirection: 'row',    
        borderRadius: 10 
    },
    video: {
      alignSelf: 'center',
      width: actuatedNormalize(400),
      height: actuatedNormalizeVertical(630),
      borderRadius: 10    
    },
    buttons: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      width: 300
    },

    button: {                
        borderRadius: 70,
        height: 65,
        width: 65,
        borderWidth: 1,
    },
    buttonInside: {
        flex: 1, 
        alignItems: "center", 
        justifyContent: "center", 
        borderRadius: 1000,  
        borderColor: "black",
        borderWidth: 1}
  })