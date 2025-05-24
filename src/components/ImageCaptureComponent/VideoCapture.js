import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity ,Text, View, Button, Property, PermissionsAndroid} from 'react-native';
import { Entypo, AntDesign, Ionicons } from '@expo/vector-icons';
//import { Camera } from "expo-camera";
import { useCameraDevice, useCameraPermission, CameraCaptureError, Camera, useFrameProcessor} from 'react-native-vision-camera'
import {useWindowDimensions} from 'react-native';
import { VIDEO_FORMAT } from '@core/constants';

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
            onRecordingFinished: (video) => {
              console.log('Video saved at:', video.path)
              setPhotoData(video.path);
            },
            onRecordingError: (error) => console.error('Recording error:', error),
            }); 
    
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
        return <Text>No access to camera</Text>;
      }


      let videoButon = (
        <TouchableOpacity  onPress={takeVideo} style={styles.button}>
            <View style={{flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 1000,  borderColor: "black",borderWidth: 1,}}>
                <Entypo name="video-camera" size={35} color="black" />
            </View>          
        </TouchableOpacity>
      );
  
      if (recording) {
        videoButon = (
          <TouchableOpacity
            onPress={stopVideo}
            style={[styles.button, { alignItems: "center", justifyContent: "center"}]}>
            
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
                    onPress={() => {
                    setType(
                        type === 'back'
                        ? 'front'
                        : 'back'
                    );
                    }}
                    style={[{
                        backgroundColor: type === 'back' ? "#0f0f0f" : "#f0f0f0",
                        color: type === 'back' ? "white" : "#fff",

                    }, styles.button]}><View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                        {type === 'back'
                        ? <AntDesign name="retweet" size={24} color="white" />
                        : <AntDesign name="retweet" size={24} color="black" />
                    }
                    </View>                 
                </TouchableOpacity>

                {videoButon}

                <TouchableOpacity
                    onPress={flashModeHandler}
                    style={styles.button}
                    >
                    <View style={{flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 1000,  borderColor: "black",borderWidth: 1,}}>
                        <Ionicons  name= { flashMode === "off" ? "flash":"flash-off"} style={{ color: "#fff", fontSize: 24}} />
                    </View>                                                                     
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
        borderRadius: 10
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
        flex: 1,
        flexDirection: "row",
        height: 125,
       
        alignItems: "center",
        justifyContent: "space-around",
      },

    stopRecording : {
        borderRadius: 50,
        height: 45,
        width: 45,
        backgroundColor: 'red'
     },
    button: {                
        borderRadius: 70,
        height: 65,
        width: 65,
        borderWidth: 1,
    }

  })