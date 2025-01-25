import { StyleSheet, Text, Button, View, TouchableHighlight } from 'react-native';
import { useEffect, useState } from 'react';
import Voice from '@react-native-voice/voice';
import { Ionicons } from '@expo/vector-icons';


export default function SpeechToText({getSpeechToTextResult}) {
  const [result, setResult] = useState('');
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    //Voice.onSpeechStart = speechStartHandler;
    Voice.onSpeechEnd = speechEndHandler;
    Voice.onSpeechResults = speechResultsHandler;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  
    /*const speechStartHandler = e => {
      console.log('speechStart successful', e);
    };*/
  
    const speechEndHandler = e => {
      setLoading(false);
      //console.log('stop handler', e);
    };
  
    const speechResultsHandler = e => {
      const text = e.value[0];
      setResult(text);
      getSpeechToTextResult(text)
    };
  
    const startRecording = async () => {
      setLoading(true);
      try {
        await Voice.start('en-Us');
      } catch (error) {
        console.log('error', error);
      }
    };
  
    const stopRecording = async () => {
      try {
        await Voice.stop();
        setLoading(false);
      } catch (error) {
        console.log('error', error);
      }
    };
  
    const clear = () => {
      setResult('');
    };
  
    return (
      <View style={styles.container}>
         {!isLoading ? <TouchableHighlight onPress={startRecording}  style={styles.button} underlayColor="#a2a1a0">
                <View style = {styles.labelContainer}>                                    
                    <Ionicons name='mic-circle-outline' size={30} color="orange" /> 
                </View>                
            </TouchableHighlight>  : undefined}

            {isLoading ? <TouchableHighlight onPress={stopRecording}  style={styles.button} underlayColor="#a2a1a0">
                <View style = {styles.labelContainer}>                                     
                    <Ionicons name='mic-off-circle-outline' size={30} color="orange" /> 
                </View>                
            </TouchableHighlight>  : undefined}        
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      marginTop: 5,
  }, 
  });