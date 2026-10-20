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
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing } from '@core/theme';


const screenWidth = Dimensions.get('screen').width;
const audioRecorderPlayer = new AudioRecorderPlayer();

const AudioCapture = ({setPhotoData, setAudioLength}) => {

const timestamp = Date.now();
const dirs = RNFetchBlob.fs.dirs;
const path = `${dirs.CacheDir}/${timestamp}.m4a`

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
      OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
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

    // Automatically stop recording after 5 seconds
    setTimeout(async () => {
      await onStopRecord();
      console.log('Recording stopped after 5 seconds');
    }, 5000);

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
        <View style={styles.micCircle}>
          <Ionicons name="mic" size={40} color={palette.onCamera} />
        </View>
        <Text style={styles.titleTxt}>Record audio</Text>
        <Text style={styles.txtRecordCounter}>{recordTime}</Text>

        <View style={styles.recordBtnWrapper}>
          <TouchableOpacity style={[styles.btn, styles.recordBtn]} onPress={onStartRecord} accessibilityLabel="Start recording">
            <Ionicons name="radio-button-on" size={20} color={palette.onCamera} />
            <Text style={styles.txt}>Record</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={onStopRecord} accessibilityLabel="Stop recording">
            <Ionicons name="stop" size={18} color={palette.onCamera} />
            <Text style={styles.txt}>Stop</Text>
          </TouchableOpacity>
        </View>

    </View>
  )

}

export default AudioCapture;


const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: palette.cameraSurface,
    borderWidth: 1,
    borderColor: palette.cameraBorder,
    alignItems: 'center',
    width: screenWidth - 32,
  },
  micCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(239,68,68,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleTxt: {
    marginTop: spacing.lg,
    color: palette.onCamera,
    fontSize: 20,
    fontWeight: '600',
  },
  txtRecordCounter: {
    marginTop: spacing.sm,
    color: palette.onCameraMuted,
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  recordBtnWrapper: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.cameraBorder,
    backgroundColor: palette.cameraSurface,
  },
  recordBtn: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  txt: {
    color: palette.onCamera,
    fontSize: 15,
    fontWeight: '600',
  },
})
