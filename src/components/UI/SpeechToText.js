import { StyleSheet, View, TouchableHighlight, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import Voice from '@react-native-voice/voice';
import { Ionicons } from '@expo/vector-icons';

// Voice is a singleton, so only the instance that started recording receives results.
// This lets several mic buttons live on one screen (e.g. one per questionnaire answer).
let activeOwner = null;

const LISTENING_COLOR = '#DC2626';

// Voice binds these function references once, on the first start() after load/destroy, and ignores
// later reassignments. So the handlers must be stable and forward to whichever instance is active.
const onSpeechEnd = () => activeOwner?.stop();
const onSpeechError = () => activeOwner?.stop();
// Partial results stream in while the user speaks; the final result may revise them.
const onSpeechResults = e => {
  const text = e.value?.[0];
  if (text) activeOwner?.onResult(text);
};

// Each result is the whole utterance so far, so callers replace the previously streamed text (prev)
// rather than appending again. If the user edited the field mid-dictation, start a new sentence instead.
export const mergeSpeechText = (current, text, prev) => {
  const base = current ?? '';
  if (prev && base.endsWith(prev)) return base.slice(0, base.length - prev.length) + text;
  if (!base) return text;
  return base + (/[.!?]\s*$/.test(base) ? ' ' : '. ') + text;
};

export default function SpeechToText({getSpeechToTextResult, style}) {
  const [isLoading, setLoading] = useState(false);
  const ownerRef = useRef({});
  const callbackRef = useRef(getSpeechToTextResult);
  callbackRef.current = getSpeechToTextResult;
  const pulse = useRef(new Animated.Value(0)).current;

  // Expanding ring around the mic while listening
  useEffect(() => {
    if (!isLoading) return;
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }));
    loop.start();
    return () => { loop.stop(); pulse.setValue(0); };
  }, [isLoading]);

  useEffect(() => {
    const owner = ownerRef.current;
    owner.stop = () => setLoading(false);
    owner.lastText = '';
    owner.onResult = text => {
      const prev = owner.lastText;
      if (text === prev) return;
      owner.lastText = text;
      callbackRef.current(text, prev);
    };
    return () => {
      if (activeOwner === owner) {
        activeOwner = null;
        Voice.destroy().then(Voice.removeAllListeners);
      }
    };
  }, []);

  const startRecording = async () => {
    const owner = ownerRef.current;
    if (activeOwner && activeOwner !== owner) activeOwner.stop();
    // Destroy (not just stop) any previous session: a stopped recognizer still emits end/error events
    // later, which would otherwise reach this new owner and flip its button back to idle.
    // Events already queued are delivered before this resolves, while the old owner is still active.
    try { await Voice.destroy(); } catch (error) { console.log('error', error); }
    activeOwner = owner;
    owner.lastText = '';

    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechResults;

    setLoading(true);
    try {
      await Voice.start('en-US');
    } catch (error) {
      console.log('error', error);
      setLoading(false);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.log('error', error);
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableHighlight onPress={isLoading ? stopRecording : startRecording} style={styles.button} underlayColor="transparent">
        <View style={styles.iconWrap}>
          {isLoading && <Animated.View style={[styles.pulse, { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }], opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }) }]} />}
          <Ionicons name={isLoading ? 'mic-circle' : 'mic-circle-outline'} size={30} color={isLoading ? LISTENING_COLOR : 'orange'} />
        </View>
      </TouchableHighlight>
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
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: LISTENING_COLOR,
  },
});
