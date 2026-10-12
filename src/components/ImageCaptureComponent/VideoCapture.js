import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity ,Text, View, Button, Property, PermissionsAndroid} from 'react-native';
import { Entypo, AntDesign, Ionicons } from '@expo/vector-icons';
//import { Camera } from "expo-camera";
import { useCameraDevice, useCameraPermission, CameraCaptureError, Camera, useFrameProcessor} from 'react-native-vision-camera'
import {useWindowDimensions} from 'react-native';
import { VIDEO_FORMAT } from '@core/constants';

import { palette, radius } from '@core/theme';

const cameraMarginTop = 70

export const VideoCapture = ({setPhotoData}) => {
    

    const [hasAudioPermission, setHasAudioPermission] = useState(null);
    const [hasCameraPermission, setHasCameraPermission] =useState(null);
    //const [camera, setCamera] = useState(null);
    const [flashMode, setFlashMode] = useState('off');
    const [type, setType] = useState('front');
    const video = React.useRef(null);
    const [recording, setRecording] = useState(false)

    
    //const device = useCameraDevice(type)
    const device = useCameraDevice('front')
    let camera = useRef(null);



    const {height: screenHeight, width: screenWidth} = useWindowDimensions();  


    /*useEffect(() => {
        (async () => {
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus.status === 'granted');
            const audioStatus = await Camera.requestMicrophonePermissionsAsync();
            setHasAudioPermission(audioStatus.status === 'granted');
        })();
      }, []);*/
      useEffect(() => {
          (async () => {
            await requestCameraPermission();
          })();
        }, []);

      const requestCameraPermission = async () => {
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.CAMERA,
              {
                title: 'iCheckify Camera Permission',
                message:
                  'iCheckify needs access to your camera',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              setHasCameraPermission(true);
              console.log('You can use the camera to record video');
            } else {
              console.log('Camera permission denied');
            }
          } catch (err) {
            console.warn(err);
          }
        };
      


      const takeVideo = async () => {
       
            setRecording(true)
            await camera.current.startRecording({
              fileType: 'mp4', 
              onRecordingFinished: (video) => {
                console.log('Video saved at:', video.path)
                setPhotoData(video.path);
              },
              onRecordingError: (error) => console.error('Recording error:', error),
              }); 

       // Automatically stop recording after 5 seconds
        setTimeout(async () => {
          await stopVideo();
          console.log('Recording stopped after 5 seconds');
        }, 5000);
    
      }

      const stopVideo = async () => {
        setRecording(false)
        camera.current.stopRecording()
      }

      const flashModeHandler = () => {
    
        if (flashMode === 'on') {
          setFlashMode(() => 'off');
        } else if (flashMode === 'off') {
          setFlashMode(() =>'on');
        } 
      };

      /*if (hasCameraPermission === null || hasAudioPermission === null ) {
        return <View />;
      }*/
      if (hasCameraPermission === false || hasAudioPermission === false) {
        return <Text style={{ color: palette.onCamera, fontSize: 15, textAlign: 'center' }}>No access to camera</Text>;
      }


      let videoButon = (
        <TouchableOpacity onPress={takeVideo} style={styles.shutter} accessibilityLabel="Start recording">
            <View style={styles.recordDot} />
        </TouchableOpacity>
      );

      if (recording) {
        videoButon = (
          <TouchableOpacity onPress={stopVideo} style={styles.shutter} accessibilityLabel="Stop recording">
            <View style={styles.stopRecording}></View>
          </TouchableOpacity>
        );
      }
  


      return (
        <View style={[styles.container, {width: screenWidth, paddingHorizontal: 4}]}>

            <View style={styles.top}> 
                <View style={styles.cameraContainer}>
                    <Camera ref={camera} 
                      device={device} 
                      video={true}
                      audio={true}
                      style={styles.fixedRatio} 
                    type={type}
                    ratio={'4:3'} 
                    isActive = {true}/>
                </View>
            </View>
            
            <View style={styles.bottom}>
            
                <TouchableOpacity
                    style={styles.sideButton}
                    accessibilityLabel="Switch camera"
                    onPress={() => {
                    setType(
                        type === 'back'
                        ? 'front'
                        : 'back'
                    );
                    }}>
                    <Ionicons name="camera-reverse-outline" size={26} color={palette.onCamera} />
                </TouchableOpacity>

                {videoButon}

                <TouchableOpacity onPress={flashModeHandler} style={styles.sideButton} accessibilityLabel="Toggle flash">
                    <Ionicons name={ flashMode === "off" ? "flash-off-outline" : "flash-outline"} size={24} color={palette.onCamera} />
                </TouchableOpacity>
            </View>
              
        </View>
      );

}


const styles = StyleSheet.create({
    container: {
        flex:1,
        maxWidth: 450,
      },
      top: {
        flex: 6,
      },
    cameraContainer: {
        flex: 1,
        marginTop: cameraMarginTop,
        borderRadius: radius.lg,
        overflow: 'hidden',
    },
    fixedRatio:{
        flex: 1,
        aspectRatio: 1
    },
    video: {
      alignSelf: 'center',
      width: 350,
      height: 220,
    },

    bottom: {
        height: 120,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
      },
    sideButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: palette.cameraSurface,
      borderWidth: 1,
      borderColor: palette.cameraBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    shutter: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 4,
      borderColor: palette.onCamera,
      alignItems: "center",
      justifyContent: "center",
    },
    recordDot: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#EF4444',
    },
    stopRecording : {
        borderRadius: 6,
        height: 30,
        width: 30,
        backgroundColor: '#EF4444'
     },
  })
