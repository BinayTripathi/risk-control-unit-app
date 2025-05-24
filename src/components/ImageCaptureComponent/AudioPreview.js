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
      navigation.goBack()
    }   
      //}


    return (
        <View style={styles.container}>
            <View style={styles.viewPlayer}>
                <TouchableOpacity style={styles.viewBarWrapper} onPress={onStatusPress}>
                    <View style={styles.viewBar}>
                        <View style={[styles.viewBarPlay, {width: playWidth}]}></View>   
                    </View>
                </TouchableOpacity>

                <Text style={styles.txtCounter}>     {playTime} / {duration}   </Text>
                <View style={styles.playBtnWrapper}>
                    <Button  style={styles.btn} onPress={onStartPlay} textStyle={styles.txt}  title= "PLAY">  Play  </Button>
                    {false && <Button style={[ styles.btn, {marginLeft: 12}]} onPress={onPausePlay} textStyle={styles.txt}  title= "PAUSE"> Pause  </Button> }
                    {false && <Button style={[ styles.btn, { marginLeft: 12}]} onPress={onResumePlay} textStyle={styles.txt}  title= "RESUME">  Resume </Button> }
                    <Button style={[styles.btn, {marginLeft: 12}]}  onPress={onStopPlay}   textStyle={styles.txt}  title= "STOP">   Stop  </Button>
                    <Button  style={styles.btn} onPress={onSaveMedia} textStyle={styles.txt}  title= "SAVE">  Play  </Button>
                </View>
            </View>
        </View>
    )

}

export default AudioPreview;

const styles = StyleSheet.create({
    container: {
      height: 300,
      marginTop: 100,
      backgroundColor: '#455A64',
      flexDirection: 'column',
      alignItems: 'center',
    },
    viewPlayer: {
        marginTop: 60,
        alignSelf: 'stretch',
        alignItems: 'center',
      },
      viewBarWrapper: {
        marginTop: 28,
        marginHorizontal: 28,
        alignSelf: 'stretch',
      },
      viewBar: {
        backgroundColor: '#ccc',
        height: 4,
        alignSelf: 'stretch',
      },
      viewBarPlay: {
        backgroundColor: 'white',
        height: 4,
        width: 0,
      },
      playStatusTxt: {
        marginTop: 8,
        color: '#ccc',
      },
      playBtnWrapper: {
        flexDirection: 'row',
        marginTop: 40,
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
      txtCounter: {
        marginTop: 12,
        color: 'white',
        fontSize: 20,
        textAlignVertical: 'center',
        fontWeight: '200',
        fontFamily: 'Helvetica Neue',
        letterSpacing: 3,
      },
    
})