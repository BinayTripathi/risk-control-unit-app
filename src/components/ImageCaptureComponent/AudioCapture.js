import React, { useState, useEffect } from 'react';

import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';

import {
  Dimensions,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button
} from 'react-native';

import RNFetchBlob from 'rn-fetch-blob';


const screenWidth = Dimensions.get('screen').width;
const audioRecorderPlayer = new AudioRecorderPlayer();

const AudioCapture = ({setPhotoData, setAudioLength}) => {

const timestamp = Date.now();
const dirs = RNFetchBlob.fs.dirs;
const path = `${dirs.CacheDir}/${timestamp}.aac`

  audioRecorderPlayer.setSubscriptionDuration(0.1); // optional. Default is 0.5


  const [recordTime, setRecordTime] = useState('00:00:00')
  const [recordSecs, setRecordSec] = useState(0)
  const [currentPositionSec, setCurrentPositionSec] = useState(0)
  const [currentDurationSec, setCurrentDurationSec] = useState(0)
  const [audioUri, setAudioUri] = useState(null)
  let uriPath=''

  let playWidth =   (currentPositionSec / currentDurationSec) * (screenWidth - 56);
  if (!playWidth) { playWidth = 0; }


  useEffect(()=> {
    //Check all permissions the first time
    (async () =>{
      if (Platform.OS === 'android') {
        try {
          const grants = await PermissionsAndroid.requestMultiple([
            //PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            //PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
  
          console.log('write external stroage', grants);
  
          if (
            //grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
            //grants['android.permission.READ_EXTERNAL_STORAGE'] ===  PermissionsAndroid.RESULTS.GRANTED &&
            grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED ) {
            console.log('permissions granted');
          } else {
            console.log('All required permissions not granted');
            return;
          }
        } catch (err) {
          console.warn(err);
          return;
        }
      }
    })()
  },[])

  const onStartRecord = async () => {    
    console.log('recording')

    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
      OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
    };

    console.log('audioSet', audioSet);

    uriPath = await audioRecorderPlayer.startRecorder(path, audioSet)

    audioRecorderPlayer.addRecordBackListener((eventRecordBackType) => {
      //console.log('record-back', eventRecordBackType);
      setRecordSec(eventRecordBackType.currentPosition)
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(eventRecordBackType.currentPosition)))      
    });
    console.log(`uriPath: ${uriPath}`);
    setAudioUri(uriPath)
    console.log(`uri: ${audioUri}`);
  };

  const onPauseRecord = async () => {
    try {
      const r = await audioRecorderPlayer.pauseRecorder();
      console.log(r);
    } catch (err) {
      console.log('pauseRecord', err);
    }
  };

  const onResumeRecord = async () => {
    await audioRecorderPlayer.resumeRecorder();
  };

  const onStopRecord = React.useCallback(async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setRecordSec(0)
    //console.log(result);
    console.log(`uri: ${audioUri}`);
    setAudioLength(playWidth)
    setPhotoData(uriPath)
  }, [audioRecorderPlayer]);



  return (
    <View style = {styles.container}>
        <Text style={styles.titleTxt}>Record Audio</Text>
        <Text style={styles.txtRecordCounter}>{recordTime}</Text>

        <View style={styles.viewRecorder}>
          <View style={styles.recordBtnWrapper}>
            <Button style={styles.btn} onPress={onStartRecord} title="Record"> Record </Button>
            <Button style={[styles.btn, { marginLeft: 12}]}  onPress={onPauseRecord} textStyle={styles.txt} title= "PAUSE"> Pause </Button>
            <Button style={[styles.btn, { marginLeft: 12}]}  onPress={onResumeRecord} textStyle={styles.txt} title="Resume"> Resume </Button>
            <Button style={[styles.btn, { marginLeft: 12}]}  onPress={onStopRecord}   textStyle={styles.txt} title = "Stop"> Stop    </Button>
          </View>
        </View>

    </View>
  )

}

export default AudioCapture;


const styles = StyleSheet.create({
  container: {
    height: 300,
      marginTop: 100,
    backgroundColor: '#455A64',
    flexDirection: 'column',
    alignItems: 'center',
  },
  titleTxt: {
    marginTop: 100,
    color: 'white',
    fontSize: 28,
  },
  viewRecorder: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  recordBtnWrapper: {
    flexDirection: 'row',
  },
  btn: {
    borderColor: 'white',
    borderWidth: 1,
  },
  txt: {
    color: 'white',
    fontSize: 14,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  txtRecordCounter: {
    marginTop: 32,
    color: 'white',
    fontSize: 20,
    textAlignVertical: 'center',
    fontWeight: '200',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 3,
  },
})