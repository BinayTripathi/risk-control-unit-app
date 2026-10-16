import { palette, radius } from '@core/theme';
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
                 LocationLongLat : tracker
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
                {!status.isPlaying && <Ionicons name="play" size={28} color={palette.onCamera} />}
                {status.isPlaying && <Ionicons name="pause" size={28} color={palette.onCamera} />}
            </View>          
    </TouchableOpacity>

    const uploadVideoBt = <TouchableOpacity  onPress={uploadVideo} 
    style={[styles.button, styles.primaryButton]} accessibilityLabel="Upload video">
        <View style={styles.buttonInside}>
            <Ionicons name="cloud-upload-outline" size={30} color={palette.onPrimary} />
        </View>          
    </TouchableOpacity>


    const retakeVideoBt = <TouchableOpacity  onPress={() => setPhotoData(null)} 
    style={styles.button}>
        <View style={styles.buttonInside}>
            <Ionicons name="refresh" size={26} color={palette.onCamera} />
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
        borderRadius: radius.lg
    },
    video: {
      alignSelf: 'center',
      width: actuatedNormalize(400),
      height: actuatedNormalizeVertical(630),
      borderRadius: radius.lg
    },
    buttons: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      width: '100%',
    },

    button: {
        borderRadius: 32,
        height: 64,
        width: 64,
        borderWidth: 1,
        borderColor: palette.cameraBorder,
        backgroundColor: palette.cameraSurface,
    },
    primaryButton: {
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 0,
        backgroundColor: palette.primary,
    },
    buttonInside: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"}
  })