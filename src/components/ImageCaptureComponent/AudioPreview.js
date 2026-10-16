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
    Button,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
  } from 'react-native';
  import React, {useEffect, useState} from 'react';
  import { useDispatch} from 'react-redux'
  import {requestUpdateAudioVideoCaseAction} from '@store/ducks/case-submission-slice'
  import { useNavigation } from "@react-navigation/native";
  import useLocationTracker from "@hooks/useLocationTracker";
  import { Ionicons } from '@expo/vector-icons';
  import { palette, radius, spacing } from '@core/theme';

  const screenWidth = Dimensions.get('screen').width;
  const audioRecorderPlayer = new AudioRecorderPlayer();

const AudioPreview = ({path, audioLength, claimId, docType, email, sectionName,
  investigationName, isLastMandatory}) => {

    const [currentPositionSec, setCurrentPositionSec] = useState(0)
    const [currentDurationSec, setCurrentDurationSec] = useState(0)
    const [playTime, setPlayTime] = useState('00:00:00',)
    const [duration, setDuration] = useState(0)
    
    const dispatch = useDispatch()
    const navigation = useNavigation();
    const tracker = useLocationTracker()

    let playWidth =
          (currentPositionSec / currentDurationSec) *  (screenWidth - 56);
        console.log(`currentPlayWidth: ${playWidth}`);

        if (!playWidth) { playWidth = 0; }


    const onStatusPress = (event) => {
        const touchX = event.nativeEvent.locationX;
        console.log(`touchX: ${touchX}`);
    
        playWidth =
          (currentPositionSec / currentDurationSec) *  (screenWidth - 56);
        console.log(`currentPlayWidth: ${playWidth}`);
    
        const currentPosition = Math.round(currentPositionSec);
    
        if (playWidth && playWidth < touchX) {
          const addSecs = Math.round(currentPosition + 1000);
          audioRecorderPlayer.seekToPlayer(addSecs);
          console.log(`addSecs: ${addSecs}`);
        } else {
          const subSecs = Math.round(currentPosition - 1000);
          audioRecorderPlayer.seekToPlayer(subSecs);
          console.log(`subSecs: ${subSecs}`);
        }
      };

      const  onStartPlay = async () => {
        console.log('onStartPlay', path);
    
        try {
          const msg = await audioRecorderPlayer.startPlayer(path);
    
          //? Default path
          //const msg = await this.audioRecorderPlayer.startPlayer();
          const volume = await audioRecorderPlayer.setVolume(1.0);
          console.log(`path: ${msg}`, `volume: ${volume}`);
    
          audioRecorderPlayer.addPlayBackListener((playBackType) => {
            console.log('playBackListener', playBackType);
            setCurrentPositionSec(playBackType.currentPosition)
            setCurrentDurationSec(playBackType.duration)
            setPlayTime(audioRecorderPlayer.mmssss(Math.floor(playBackType.currentPosition)))
            setDuration(audioRecorderPlayer.mmssss(Math.floor(playBackType.duration)))           
          });
        } catch (err) {
          console.log('startPlayer error', err);
        }
      };


      const onPausePlay = async () => {
        await audioRecorderPlayer.pausePlayer();
      };
    
      const onResumePlay = async () => {
        await audioRecorderPlayer.resumePlayer();
      };
    
      const  onStopPlay = async () => {
        console.log('onStopPlay');
        audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();
      };

      const onSaveMedia = async () => {
        

      const mediaDetails = {
        email : email,
        caseId: claimId,            
        docType: docType.type,
        capability: docType.name,
        sectionName,
        investigationName,
        isLastMandatory,
        mediaPath: path,
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
      navigation.goBack()
    }   
      //}


    return (
        <View style={styles.container}>
            <Text style={styles.titleTxt}>Review recording</Text>
            <TouchableOpacity style={styles.viewBarWrapper} onPress={onStatusPress}>
                <View style={styles.viewBar}>
                    <View style={[styles.viewBarPlay, {width: playWidth}]}></View>
                </View>
            </TouchableOpacity>

            <Text style={styles.txtCounter}>{playTime} / {duration}</Text>

            <View style={styles.playBtnWrapper}>
                <TouchableOpacity style={styles.iconBtn} onPress={onStartPlay} accessibilityLabel="Play">
                    <Ionicons name="play" size={24} color={palette.onCamera} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={onStopPlay} accessibilityLabel="Stop">
                    <Ionicons name="stop" size={22} color={palette.onCamera} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={onSaveMedia}>
                <Ionicons name="cloud-upload-outline" size={20} color={palette.onPrimary} />
                <Text style={styles.saveTxt}>Save recording</Text>
            </TouchableOpacity>
        </View>
    )

}

export default AudioPreview;

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
    titleTxt: {
      color: palette.onCamera,
      fontSize: 20,
      fontWeight: '600',
    },
    viewBarWrapper: {
      marginTop: spacing.xl,
      alignSelf: 'stretch',
      paddingVertical: spacing.sm,
    },
    viewBar: {
      backgroundColor: palette.cameraBorder,
      height: 4,
      borderRadius: 2,
      alignSelf: 'stretch',
    },
    viewBarPlay: {
      backgroundColor: palette.onCamera,
      height: 4,
      borderRadius: 2,
      width: 0,
    },
    txtCounter: {
      marginTop: spacing.sm,
      color: palette.onCameraMuted,
      fontSize: 16,
      fontVariant: ['tabular-nums'],
    },
    playBtnWrapper: {
      flexDirection: 'row',
      marginTop: spacing.xl,
      gap: spacing.lg,
    },
    iconBtn: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: palette.cameraBorder,
      backgroundColor: palette.cameraSurface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.xl,
      height: 52,
      alignSelf: 'stretch',
      borderRadius: radius.md,
      backgroundColor: palette.primary,
    },
    saveTxt: {
      color: palette.onPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
})
