import React, { useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, TouchableOpacity, View, PermissionsAndroid,Text, Dimensions, ActivityIndicator, } from "react-native";
import { FontAwesome, AntDesign, Ionicons } from '@expo/vector-icons';

import { useCameraDevice, useCameraPermission, CameraCaptureError, Camera, useFrameProcessor} from 'react-native-vision-camera'
import { Face,
  runAsync,
  useFaceDetector,
  FaceDetectionOptions} from 'react-native-vision-camera-face-detector'
import { Worklets } from 'react-native-worklets-core'
import * as FileSystem from 'expo-file-system';

import {useWindowDimensions} from 'react-native';
import { AnimatedCircularProgress } from "react-native-circular-progress"
import Svg, {Polyline} from "react-native-svg";


import Paragraph from '@components/UI/Paragraph'
import { DOC_TYPE } from '@core/constants';
import _ from "lodash";
import * as Speech from 'expo-speech';

let isFrameProcessed = false
const cameraMarginTop = 70
const { width: windowWidth, height: windowHeight } = Dimensions.get("window")
const PREVIEW_SIZE = 325
const PREVIEW_RECT = {
  minX: (windowWidth - PREVIEW_SIZE) / 2,
  minY: cameraMarginTop + 20,
  width: PREVIEW_SIZE,
  height: PREVIEW_SIZE,
}

const instructionsText = {
  initialPrompt: "Position your face in the screen and hold still",
  performActions: "Keep the device still and perform the following actions:",
  tooClose: "You're too close. Hold the device further.",
  tooFar: "You're too far. Hold the device closer."
}

const livelinessDetectionParam = {
  BLINK: { instruction: "Blink both eyes", minProbability: 0.3 },
  TURN_HEAD_LEFT: { instruction: "Turn head left", maxAngle: 15 },
  TURN_HEAD_RIGHT: { instruction: "Turn head right", minAngle: -15 },
  NOD: { instruction: "Nod", minDiff: 1.5 },
  SMILE: { instruction: "Smile", minProbability: 0.7 },
}


const detectionsList = [
  "BLINK",
  "TURN_HEAD_LEFT",
  "TURN_HEAD_RIGHT",
  "SMILE",
  "NOD",
  
]

const initialState = {
  faceDetected: false ,
  faceTooBig: false ,
  faceTooSmall: false ,
  detectionsList,
  currentDetectionIndex: 0,
  progressFill: 0,
  processComplete: false,
  highLevelInstruction: instructionsText.initialPrompt,
  actionToPerform: ''
}
  

const ImageCapture = ({setPhotoData, docType, setBothEyeOpen, setSmiling}) => {
 

  const { hasPermission, setHasPermission } = useCameraPermission();
  const [isCameraInitialized, setIsCameraInitialized] = useState(false)
  const [flashMode, setFlashMode] = useState('off');
  const [type, setType] = useState('front');
  const device = useCameraDevice(type)
  let camera = useRef(null);
  const frameCount = useRef(0);

  const faceDetectionOptions = useRef( {
    classificationMode: 'all',
    contourMode: 'all',
    performanceMode: 'fast',
    //autoScale: true

  } ).current
  const { detectFaces } = useFaceDetector( faceDetectionOptions )

  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const {height: screenHeight, width: screenWidth} = useWindowDimensions();  
  const [faceData, setFaceData] = React.useState(initialState);
  const [faces, setFaces] = React.useState([]);

  const rollAngles = useRef([])
  const [livelinessCheckDone, setLivelinessCheckDone] = useState(false)

  const [textToSpeak, setTestToSpeak] = useState("Position your face in the screen and hold still for liveliness check")
  const debouncedSetFaceData = _.debounce((newFaceData, actionToPerform) => {
    setFaceData(newFaceData);
    if(newFaceData.actionToPerform !== actionToPerform) {
      if(newFaceData.actionToPerform === '')
        setTestToSpeak(newFaceData.highLevelInstruction)
      else
        setTestToSpeak(newFaceData.actionToPerform)
    }
  }, 100); // 100ms delay

  
  
  if (hasPermission === null) {
    return <Text>Checking camera permission...</Text>;
  } else if (!hasPermission) {
    
  }

  if (!device) {
    return <Text>No camera device available</Text>;
  }

  useEffect(() => {
    (async () => {
      await requestCameraPermission();
    })();
  }, [device]);

  useEffect(() => {
    if (textToSpeak) {
      Speech.stop()
      Speech.speak(textToSpeak);
    }
  },[textToSpeak])




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
        console.log('You can use the camera');
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };


  const flashModeHandler = () => {
    
    if (flashMode === 'on') {
      setFlashMode(() => 'off');
    } else if (flashMode === 'off') {
      setFlashMode(() =>'on');
    } 
  };


  const handleDetectedFaces = Worklets.createRunOnJS( (faces) => { 

    if (faces.length === 1) {
      let face = faces[0]
      
      let faceBoundary = {
        minY: face.contours.FACE['0']['y'],
        minX: face.contours.FACE['0']['x'],
        width: face.bounds.width,
        height: face.bounds.height
      }

      const edgeOffset = 10
      const faceRectSmaller = {
        width: faceBoundary.width + edgeOffset,
        height: faceBoundary.height + edgeOffset,
        //minY: faceBoundary.minY + edgeOffset ,
        //minX: faceBoundary.minX + edgeOffset 
        minY: face.contours.FACE['0']['y']-edgeOffset/2,
        minX: face.contours.FACE['0']['x']-edgeOffset/2,
      }
  
      let previewContainsFace = true/*contains({
        outside: PREVIEW_RECT,
        inside: faceBoundary
      })*/
  
      let isPreviewTooSmall = false//faceBoundary.width < PREVIEW_SIZE

      //Camera is very close
      if(!previewContainsFace && !isPreviewTooSmall) {        
        let payload = {...faceData,
          faceDetected: true ,
          faceTooBig: true,
          faceTooSmall: false,
          highLevelInstruction: instructionsText.tooClose,
          faceBoundary,
          faceRectSmaller

        }
        debouncedSetFaceData(payload, faceData.actionToPerform)
      }

      //Camera is very far
      if(previewContainsFace && isPreviewTooSmall) {
        let payload = {...faceData,
          faceDetected: true ,
          faceTooBig: false,
          faceTooSmall: true,
          highLevelInstruction: instructionsText.tooFar,
          faceBoundary,
          faceRectSmaller
        }
        debouncedSetFaceData(payload, faceData.actionToPerform)
      }

      
      if(previewContainsFace && !isPreviewTooSmall) {
        
        if(faceData.currentDetectionIndex < faceData.detectionsList.length){
          const detectionAction = faceData.detectionsList[faceData.currentDetectionIndex]
        let payload = {...faceData,
          faceDetected: true ,
          faceTooBig: false,
          faceTooSmall: false,
          highLevelInstruction: instructionsText.performActions,
          progressFill: 100 / (faceData.detectionsList.length + 1),
          actionToPerform: livelinessDetectionParam[detectionAction].instruction,
          faceBoundary,
          faceRectSmaller
        }
        debouncedSetFaceData(payload, faceData.actionToPerform)
        handleUserActions(detectionAction,face)
        } else {
          let payload = {...faceData,
            faceDetected: true ,
            faceTooBig: false,
            faceTooSmall: false,
            highLevelInstruction: 'Liveliness Detection Done',
            progressFill: 100 / (faceData.detectionsList.length + 1),
            actionToPerform: 'Please click image capture button',
            faceBoundary,
            faceRectSmaller
          }
          debouncedSetFaceData(payload, faceData.actionToPerform)
          setLivelinessCheckDone(true)
        }
        
      }
      
    } else 
    debouncedSetFaceData(initialState, faceData.actionToPerform)   
  })



  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    if(!isFrameProcessed) {
      const faces = detectFaces(frame)
      if (frameCount.current % 5 === 0) {
        // Process only every 5th frame
        handleDetectedFaces(faces);
      }
      frameCount.current++;
    } else {
      console.log("Skipping frame: Previous frame is still being processed");
    }
  
      
  }, [handleDetectedFaces])


  const handleUserActions = (detectionAction, face) => {

    /*if(faceData === undefined || faceData.length === undefined)
    console.log(`${JSON.stringify(faceData)} < ${docType.faceCount} && ${livelinessCheckDone}`)*/

    console.log(`${faceData.highLevelInstruction} ~ ${faceData.actionToPerform}`)
    switch (detectionAction) {
      case "BLINK":
        const leftEyeClosed =
          face.leftEyeOpenProbability <= livelinessDetectionParam.BLINK.minProbability
        const rightEyeClosed =
          face.rightEyeOpenProbability <= livelinessDetectionParam.BLINK.minProbability
        if (leftEyeClosed && rightEyeClosed) {
          let newFaceData = {...faceData,
            currentDetectionIndex : faceData.currentDetectionIndex + 1
            //progressFill: newProgressFill
          } 
          debouncedSetFaceData(newFaceData, faceData.actionToPerform)
          console.log('---------blinking called')
        }
        return
      case "NOD":
        // Collect roll angle data
        rollAngles.current.push(face.rollAngle)

        // Don't keep more than 10 roll angles (10 detection frames)
        if (rollAngles.current.length > 10) {
          rollAngles.current.shift()
        }

        // If not enough roll angle data, then don't process
        if (rollAngles.current.length < 10) return

        // Calculate avg from collected data, except current angle data
        const rollAnglesExceptCurrent = [...rollAngles.current].splice(
          0,
          rollAngles.current.length - 1
        )

        // Summation
        const rollAnglesSum = rollAnglesExceptCurrent.reduce((prev, curr) => {
          return prev + Math.abs(curr)
        }, 0)

        // Average
        const avgAngle = rollAnglesSum / rollAnglesExceptCurrent.length

        // If the difference between the current angle and the average is above threshold, pass.
        const diff = Math.abs(avgAngle - Math.abs(face.rollAngle))

        if (diff >= livelinessDetectionParam.NOD.minDiff) {
          let newFaceData = {...faceData,
            currentDetectionIndex : faceData.currentDetectionIndex + 1
            //progressFill: newProgressFill
          } 
          debouncedSetFaceData(newFaceData,  faceData.actionToPerform)
          console.log('---------noded')
        }
        return
      case "TURN_HEAD_LEFT":
        // Negative angle is the when the face turns left
        if (face.yawAngle >= livelinessDetectionParam.TURN_HEAD_LEFT.maxAngle) {
          let newFaceData = {...faceData,
            currentDetectionIndex : faceData.currentDetectionIndex + 1
            //progressFill: newProgressFill
          } 
          debouncedSetFaceData(newFaceData, faceData.actionToPerform)
          console.log('---------head turned left')
        }
        return
      case "TURN_HEAD_RIGHT":
        // Positive angle is the when the face turns right
        if (face.yawAngle <= livelinessDetectionParam.TURN_HEAD_RIGHT.minAngle) {
          let newFaceData = {...faceData,
            currentDetectionIndex : faceData.currentDetectionIndex + 1
            //progressFill: newProgressFill
          } 
          debouncedSetFaceData(newFaceData, faceData.actionToPerform)
          console.log('---------head turned right')
        }
        return
      case "SMILE":
        // Higher probabiltiy is when smiling
        if (face.smilingProbability >= livelinessDetectionParam.SMILE.minProbability) {
          let newFaceData = {...faceData,
            currentDetectionIndex : faceData.currentDetectionIndex + 1
            //progressFill: newProgressFill
          } 
          debouncedSetFaceData(newFaceData,  faceData.actionToPerform)
          console.log('---------smiled')
        }
        return
    }
  }

 
  const takePhoto = async () => {

    try {
      if (!camera.current) {
        console.error('Camera reference not available.', camera);
        return;
      }

      const photo = await camera.current.takePhoto();
      console.log(photo);
      
      if (photo) {
        console.log(`file://${photo.path}`)
        //const base64 = await FileSystem.readAsStringAsync(`file://${photo.path}`, { encoding: 'base64' });
        //setPhotoData(base64.replaceAll(" ","+"));
        setPhotoData(`file://${photo.path}`)
      } else {
        console.error('Photo captured is undefined or empty.');
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
    
  };

  const onCameraReady = (ref) => {
    // Camera component is ready, set the camera reference
    camera.current = ref;// Reference to the Camera component (e.g., obtained from ref prop)
  };

  function contains({ outside, inside }) {
    const outsideMaxX = outside.minX + outside.width
    const insideMaxX = inside.minX + inside.width
    const outsideMaxY = outside.minY + outside.height
    const insideMaxY = inside.minY + inside.height
    if (inside.minX < outside.minX) {
      return false
    }
    if (insideMaxX > outsideMaxX) {
      return false
    }
    if (inside.minY < outside.minY) {
      return false
    }
    if (insideMaxY > outsideMaxY) {
      return false
    }
    return true
  }

  let boundingArea = faceData.faceBoundary === undefined ? <View/> :
  
      <View  style= {[styles.facebox, {marginLeft: PREVIEW_RECT.minX, 
        marginTop: PREVIEW_RECT.minY, 
        width: PREVIEW_RECT.width,
        height: PREVIEW_RECT.height}]}> 


      </View>
    
  
  

  return (
    <View style={[styles.container, {width: screenWidth, paddingHorizontal: 4}]}>     
          
        <View style={styles.top}>       
        
          
          <Camera style={styles.cameraContainer} 
              ref={(ref) => onCameraReady(ref)} 
              type={type} 
              device={device}
              frameProcessor={frameProcessor}
              flashMode={flashMode === "on" ? "on": "off"}
              isActive={true}
              photo={true}/>
              {boundingArea}
        </View>
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>{faceData.highLevelInstruction}</Text>
          <Text style={styles.action}>{faceData.actionToPerform}</Text>
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
              style={{
                backgroundColor: type === 'back' ? "#0f0f0f" : "#f0f0f0",
                color: type === 'back' ? "white" : "#fff",
                borderRadius: 70,
                height: 65,
                width: 65,
              }}><View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                {type === 'back'
                  ? <AntDesign name="retweet" size={24} color="white" />
                  : <AntDesign name="retweet" size={24} color="black" />
              }
              </View>                 
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={takePhoto} disabled={faces.length < docType.faceCount && !livelinessCheckDone}>
              <FontAwesome name="camera" style={[ faces.length < docType.faceCount && !livelinessCheckDone? 
                { color: "grey", fontSize: 40} :{ color: "white", fontSize: 40}]}  />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={flashModeHandler}
              style={{                  
                borderRadius: 70,
                height: 65,
                width: 65,
              }}
            >
              <View style={{flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 1000,  borderColor: "white",borderWidth: 1,}}>
                <Ionicons  name= { flashMode === "off" ? "flash":"flash-off"} style={{ color: "#fff", fontSize: 24}} />
              </View>
            </TouchableOpacity>
        </View>
      
    </View>
  );
}

export default ImageCapture;

const styles = StyleSheet.create({
    container: {
      flex:1,
      maxWidth: 450,
    },
    cameraContainer: {
      flex: 1,
      marginTop: cameraMarginTop,
      borderRadius: 10
    },
    top: {
      flex: 6,
    },
    bottom: {
      flex: 1,
      flexDirection: "row",
      height: 125,
     
      alignItems: "center",
      justifyContent: "space-around",
    },
    button: {
      height: 65,
      width: 65,
      borderRadius: 1000,
      borderColor: "white",
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    facebox: {
      borderColor: 'green',
      borderWidth: 2,
      position: 'absolute',
    },
    noFaceWarning : {
      position: 'absolute',
      fontWeight: '900',
      fontSize: 16,
      color: 'red'
    },
    mask: {
      borderRadius: PREVIEW_SIZE / 2,
      height: PREVIEW_SIZE,
      width: PREVIEW_SIZE,
      marginTop: PREVIEW_RECT.minY,
      alignSelf: "center",
      backgroundColor: "white",
    },
    circularProgress: {
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
      marginTop: PREVIEW_RECT.minY,
      marginLeft: PREVIEW_RECT.minX,
    },
    instructions: {
      fontSize: 20,
      textAlign: "center",
    },
    instructionsContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    action: {
      fontSize: 24,
      textAlign: "center",
      fontWeight: "bold",
    }
  });