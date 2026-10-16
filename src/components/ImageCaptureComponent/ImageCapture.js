import React, { useState, useEffect, useRef, useMemo } from "react";
import { StyleSheet, TouchableOpacity, View, PermissionsAndroid,Text } from "react-native";
import { FontAwesome, AntDesign, Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing } from '@core/theme';

import { useCameraDevice, useCameraPermission, Camera, useFrameProcessor} from 'react-native-vision-camera'
import { useFaceDetector } from 'react-native-vision-camera-face-detector'
import { Worklets } from 'react-native-worklets-core'
import { AnimatedCircularProgress } from "react-native-circular-progress"

import {useWindowDimensions} from 'react-native';
import * as Speech from 'expo-speech';

const cameraMarginTop = 70

const instructionsText = {
  initialPrompt: "Position your face inside the circle and hold still",
  calibrating: "Hold still",
  faceScreen: "Look at the screen",
  performActions: "Keep the device still and perform the following action:",
  done: "Liveliness Detection Done",
  holdStill: "Look straight at the camera with eyes open",
  capture: "Please click image capture button",
  wrongMovement: "Wrong movement detected",
  tooSlow: "Action not completed in time",
  faceChanged: "A different face was detected",
  faceLost: "Face moved out of view",
  restarting: "Starting again with new actions",
  failed: "Liveliness check failed",
  tryAgain: "Tap Try again to restart",
  moveCloser: "Move the device closer to your face",
  moveAway: "Move the device further from your face",
  singleFace: "Only one face should be in view",
  bothFaces: "Both faces should be in view",
}

// Pool of challenge gestures. Each check returns 'pass', 'wrong' or 'pending'.
const livelinessDetectionParam = {
  BLINK: { instruction: "Blink both eyes" },
  TURN_HEAD_LEFT: { instruction: "Turn your head left" },
  TURN_HEAD_RIGHT: { instruction: "Turn your head right" },
  LOOK_UP: { instruction: "Look up" },
  LOOK_DOWN: { instruction: "Look down" },
}

// Number of gestures asked per attempt, picked at random so a recorded video cannot anticipate them
const CHALLENGE_LENGTH = 4
const MAX_ATTEMPTS = 3

const THRESHOLDS = {
  eyeOpen: 0.6,
  eyeClosed: 0.3,
  // Head angles (degrees) that count as looking straight at the camera
  neutralYaw: 10,
  neutralPitch: 10,
  // Head angles that complete a turn / look gesture
  turnYaw: 20,
  lookPitch: 15,
  // Head angles in a direction other than the requested one that fail the attempt
  wrongYaw: 25,
  wrongPitch: 20,
  // Face width as a fraction of the image width
  minFaceWidth: 0.22,
  minFaceWidthGroup: 0.15,
  maxFaceWidth: 0.9,
}

// Head angles are measured relative to the user's resting pose, captured over a few
// steady frames at the start of each attempt. This lets the phone be held at any
// comfortable angle instead of exactly upright in front of the face.
const CALIBRATION_FRAMES = 8
const CALIBRATION_MAX_SPREAD = 6
// Resting angles beyond these mean the user is not facing the phone at all
const MAX_BASELINE_YAW = 25
const MAX_BASELINE_PITCH = 35

// If testing on a device shows left/right or up/down reversed, flip the matching sign
const YAW_SIGN = 1
const PITCH_SIGN = 1

// Consecutive frames a pose must be held, to filter out detector noise
const HOLD_FRAMES = 2
const WRONG_FRAMES = 3
// Pause after each completed action so the user can return to a neutral pose
const STEP_COOLDOWN_MS = 700
// Time (while the face is properly in view) allowed to complete one action
const STEP_TIMEOUT_MS = 8000
// How long a failure / restart message stays on screen
const NOTICE_MS = 2000
// A positioning problem must persist this long before it is shown, to avoid flicker
const ISSUE_DISPLAY_DELAY_MS = 400
// Face may drop out of detection this long without pausing the current action
const FACE_LOST_GRACE_MS = 500
// Face missing this long after progress was made restarts the check
const FACE_LOST_RESTART_MS = 2000
// A new tracking id within this window of the previous face means the face was swapped
const FACE_SWAP_WINDOW_MS = 300

const shuffle = (items) => {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const newChallenge = () => shuffle(Object.keys(livelinessDetectionParam)).slice(0, CHALLENGE_LENGTH)

const newStepState = (startedAt) => ({
  startedAt,
  activeMs: 0,
  armed: false,
  holdFrames: 0,
  wrongFrames: 0,
})

const newSession = (now, attempts = 0, notice = null) => {
  const startAt = notice ? notice.until : now
  return {
    challenge: newChallenge(),
    stepIndex: 0,
    step: newStepState(startAt),
    attempts,
    done: false,
    locked: false,
    captured: false,
    trackingId: null,
    baseline: null,
    calibrationSamples: [],
    lastFaceSeenAt: now,
    lastFrameAt: now,
    issue: null,
    notice,
  }
}

// When several faces are in view (e.g. Dual FaceReader), check the most prominent one
const pickLargestFace = (faces) => {
  if (!faces || faces.length === 0) return null
  return faces.reduce((largest, face) =>
    face.bounds.width * face.bounds.height > largest.bounds.width * largest.bounds.height ? face : largest)
}

const getFaceIssue = (face, faceCount, requiredFaces, frameWidth, frameHeight) => {
  if (requiredFaces > 1 && faceCount < requiredFaces) return instructionsText.bothFaces
  if (requiredFaces <= 1 && faceCount > 1) return instructionsText.singleFace

  // Frames arrive in sensor orientation; in portrait the upright image width is the shorter side
  const imageWidth = Math.min(frameWidth, frameHeight)
  if (!imageWidth) return null
  const widthRatio = face.bounds.width / imageWidth
  const minWidth = requiredFaces > 1 ? THRESHOLDS.minFaceWidthGroup : THRESHOLDS.minFaceWidth
  if (widthRatio < minWidth) return instructionsText.moveCloser
  if (widthRatio > THRESHOLDS.maxFaceWidth) return instructionsText.moveAway
  return null
}

// Normalise so positive yaw is the user's own left and positive pitch is looking up
const toPose = (face, isMirrored) => ({
  yaw: face.yawAngle * YAW_SIGN * (isMirrored ? -1 : 1),
  pitch: face.pitchAngle * PITCH_SIGN,
  leftEye: face.leftEyeOpenProbability,
  rightEye: face.rightEyeOpenProbability,
})

const hasClassification = (value) => value != null && value >= 0

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

const spread = (values) => Math.max(...values) - Math.min(...values)

// Collects steady frames and returns { baseline } once the resting pose is known,
// or { issue } when the user is not facing the phone.
const calibrate = (samples, rawPose) => {
  samples.push(rawPose)
  if (samples.length > CALIBRATION_FRAMES) samples.shift()
  if (samples.length < CALIBRATION_FRAMES) return {}

  const yaws = samples.map((sample) => sample.yaw)
  const pitches = samples.map((sample) => sample.pitch)
  if (spread(yaws) > CALIBRATION_MAX_SPREAD || spread(pitches) > CALIBRATION_MAX_SPREAD) return {}

  const yaw = median(yaws)
  const pitch = median(pitches)
  if (Math.abs(yaw) > MAX_BASELINE_YAW || Math.abs(pitch) > MAX_BASELINE_PITCH) {
    return { issue: instructionsText.faceScreen }
  }

  // Eyes look narrower when looking down at a phone, so scale the eye thresholds to the user
  const eyeValues = samples
    .filter((sample) => hasClassification(sample.leftEye) && hasClassification(sample.rightEye))
    .map((sample) => Math.min(sample.leftEye, sample.rightEye))
  const restingEyes = eyeValues.length ? median(eyeValues) : 1
  return {
    baseline: {
      yaw,
      pitch,
      eyeOpen: Math.min(THRESHOLDS.eyeOpen, restingEyes * 0.8),
      eyeClosed: Math.min(THRESHOLDS.eyeClosed, restingEyes * 0.4),
    }
  }
}

const relativePose = (rawPose, baseline) => ({
  ...rawPose,
  yaw: rawPose.yaw - baseline.yaw,
  pitch: rawPose.pitch - baseline.pitch,
  eyeOpenThreshold: baseline.eyeOpen,
  eyeClosedThreshold: baseline.eyeClosed,
})

const isNeutralHead = (pose) =>
  Math.abs(pose.yaw) < THRESHOLDS.neutralYaw && Math.abs(pose.pitch) < THRESHOLDS.neutralPitch

const eyesOpen = (pose) =>
  hasClassification(pose.leftEye) && hasClassification(pose.rightEye) &&
  pose.leftEye >= pose.eyeOpenThreshold && pose.rightEye >= pose.eyeOpenThreshold

const isGesturePosed = (gesture, pose) => {
  switch (gesture) {
    case "BLINK":
      return hasClassification(pose.leftEye) && hasClassification(pose.rightEye) &&
        pose.leftEye <= pose.eyeClosedThreshold && pose.rightEye <= pose.eyeClosedThreshold
    case "TURN_HEAD_LEFT":
      return pose.yaw >= THRESHOLDS.turnYaw && Math.abs(pose.pitch) < THRESHOLDS.wrongPitch
    case "TURN_HEAD_RIGHT":
      return pose.yaw <= -THRESHOLDS.turnYaw && Math.abs(pose.pitch) < THRESHOLDS.wrongPitch
    case "LOOK_UP":
      return pose.pitch >= THRESHOLDS.lookPitch && Math.abs(pose.yaw) < THRESHOLDS.wrongYaw
    case "LOOK_DOWN":
      return pose.pitch <= -THRESHOLDS.lookPitch && Math.abs(pose.yaw) < THRESHOLDS.wrongYaw
  }
  return false
}

// Large head movements in a direction that was not asked for. Blinks are involuntary
// enough that they never count as a wrong movement.
const wrongHeadMovement = (gesture, pose) => {
  const moves = {
    TURN_HEAD_LEFT: pose.yaw >= THRESHOLDS.wrongYaw,
    TURN_HEAD_RIGHT: pose.yaw <= -THRESHOLDS.wrongYaw,
    LOOK_UP: pose.pitch >= THRESHOLDS.wrongPitch,
    LOOK_DOWN: pose.pitch <= -THRESHOLDS.wrongPitch,
  }
  return Object.keys(moves).some((move) => move !== gesture && moves[move])
}

// A gesture only counts after a neutral pose is seen, so a pose held over from the
// previous action (or a static photo) cannot pass it.
const evaluateGesture = (gesture, pose, step) => {
  if (!step.armed) {
    if (!isNeutralHead(pose)) return 'pending'
    if (gesture === "BLINK" && !eyesOpen(pose)) return 'pending'
    step.armed = true
    return 'pending'
  }

  if (isGesturePosed(gesture, pose)) {
    step.holdFrames++
    step.wrongFrames = 0
    // A blink is too short to hold across several frames
    const required = gesture === "BLINK" ? 1 : HOLD_FRAMES
    return step.holdFrames >= required ? 'pass' : 'pending'
  }
  step.holdFrames = 0

  step.wrongFrames = wrongHeadMovement(gesture, pose) ? step.wrongFrames + 1 : 0
  return step.wrongFrames >= WRONG_FRAMES ? 'wrong' : 'pending'
}

// Contours are not needed for liveliness and slow detection down considerably.
// Tracking gives each face an id, so a swapped face can be detected.
const FACE_DETECTOR_OPTIONS = {
  classificationMode: 'all',
  contourMode: 'none',
  performanceMode: 'fast',
  trackingEnabled: true,
}

const initialInstructions = {
  highLevelInstruction: instructionsText.initialPrompt,
  actionToPerform: '',
  status: 'idle', // idle | active | issue | failed | done
}

const ImageCapture = ({setPhotoData, docType}) => {

  const { hasPermission } = useCameraPermission();
  const [flashMode, setFlashMode] = useState('off');
  const [type, setType] = useState('front');
  const device = useCameraDevice(type)
  let camera = useRef(null);

  const livelinessRequired = docType.faceCount > 0
  const { detectFaces } = useFaceDetector( FACE_DETECTOR_OPTIONS )

  const {width: screenWidth} = useWindowDimensions();
  const ringSize = Math.min(screenWidth - 40, 320)

  const [livelinessCheckDone, setLivelinessCheckDone] = useState(false)
  const [checkLocked, setCheckLocked] = useState(false)
  const [completedSteps, setCompletedSteps] = useState(0)
  const [instructions, setInstructions] = useState(initialInstructions)

  // Liveliness progress lives in a ref so every frame sees the latest state
  const session = useRef(newSession(Date.now()))
  const isCapturing = useRef(false)

  const resetLiveliness = () => {
    session.current = newSession(Date.now())
    setCompletedSteps(0)
    setLivelinessCheckDone(false)
    setCheckLocked(false)
    setInstructions(initialInstructions)
  }

  useEffect(() => {
    (async () => {
      await requestCameraPermission();
    })();
  }, [device]);

  // Switching camera starts a fresh check
  useEffect(() => {
    resetLiveliness()
  }, [type])

  useEffect(() => {
    if (!livelinessRequired) return
    const textToSpeak = instructions.actionToPerform || instructions.highLevelInstruction
    if (textToSpeak) {
      Speech.stop()
      Speech.speak(textToSpeak);
    }
  },[instructions.actionToPerform, instructions.highLevelInstruction])

  useEffect(() => () => Speech.stop(), [])

  const updateInstructions = (highLevelInstruction, actionToPerform, status) => {
    setInstructions((prev) =>
      prev.highLevelInstruction === highLevelInstruction &&
      prev.actionToPerform === actionToPerform &&
      prev.status === status ? prev : { highLevelInstruction, actionToPerform, status })
  }

  const restartLiveliness = (now, reason, countsAsAttempt) => {
    const attempts = session.current.attempts + (countsAsAttempt ? 1 : 0)
    setCompletedSteps(0)
    setLivelinessCheckDone(false)

    if (attempts >= MAX_ATTEMPTS) {
      session.current = { ...newSession(now, attempts), locked: true }
      setCheckLocked(true)
      updateInstructions(instructionsText.failed, instructionsText.tryAgain, 'failed')
      return
    }

    const notice = { highLevelInstruction: reason, actionToPerform: instructionsText.restarting, until: now + NOTICE_MS }
    session.current = newSession(now, attempts, notice)
    updateInstructions(notice.highLevelInstruction, notice.actionToPerform, 'failed')
  }

  const handleDetectedFaces = (faces, frameWidth, frameHeight, isMirrored) => {
    const now = Date.now()
    const s = session.current
    const frameDelta = Math.min(now - s.lastFrameAt, 200)
    s.lastFrameAt = now
    if (!livelinessRequired || s.locked || s.captured) return

    if (s.notice) {
      if (now < s.notice.until) return
      s.notice = null
    }

    const face = pickLargestFace(faces)
    if (!face) {
      const missingFor = now - s.lastFaceSeenAt
      if (missingFor > FACE_LOST_RESTART_MS && (s.stepIndex > 0 || s.done)) {
        restartLiveliness(now, instructionsText.faceLost, false)
      } else if (missingFor > FACE_LOST_GRACE_MS) {
        s.step.armed = false
        s.step.holdFrames = 0
        updateInstructions(instructionsText.initialPrompt, '', 'issue')
      }
      return
    }

    const trackingId = face.trackingId
    if (trackingId != null && trackingId !== -1) {
      if (s.trackingId !== null && trackingId !== s.trackingId) {
        if (now - s.lastFaceSeenAt < FACE_SWAP_WINDOW_MS && (s.stepIndex > 0 || s.done)) {
          restartLiveliness(now, instructionsText.faceChanged, false)
          session.current.trackingId = trackingId
          return
        }
        // Face was re-acquired after a short gap: keep progress but re-check from neutral
        s.step.armed = false
      }
      s.trackingId = trackingId
    }
    s.lastFaceSeenAt = now

    const issue = getFaceIssue(face, faces.length, docType.faceCount, frameWidth, frameHeight)
    if (issue) {
      if (!s.issue || s.issue.text !== issue) s.issue = { text: issue, since: now }
      s.step.holdFrames = 0
      if (now - s.issue.since >= ISSUE_DISPLAY_DELAY_MS) {
        s.step.armed = false
        updateInstructions(issue, '', 'issue')
      }
      return
    }
    s.issue = null

    const rawPose = toPose(face, isMirrored)
    if (!s.baseline) {
      const { baseline, issue: calibrationIssue } = calibrate(s.calibrationSamples, rawPose)
      if (!baseline) {
        updateInstructions(calibrationIssue ?? instructionsText.calibrating, '', calibrationIssue ? 'issue' : 'idle')
        return
      }
      console.log(`---------baseline yaw ${baseline.yaw.toFixed(1)} pitch ${baseline.pitch.toFixed(1)}`)
      s.baseline = baseline
      s.step = newStepState(now)
    }
    const pose = relativePose(rawPose, s.baseline)

    // Take the photo of the same live face automatically once it looks straight ahead
    if (s.done) {
      if (isNeutralHead(pose) && eyesOpen(pose) && !isCapturing.current) {
        s.captured = true
        takePhoto()
      } else {
        updateInstructions(instructionsText.done, instructionsText.holdStill, 'done')
      }
      return
    }

    const gesture = s.challenge[s.stepIndex]
    updateInstructions(instructionsText.performActions, livelinessDetectionParam[gesture].instruction, 'active')

    if (now - s.step.startedAt < STEP_COOLDOWN_MS) return
    s.step.activeMs += frameDelta
    if (s.step.activeMs > STEP_TIMEOUT_MS) {
      restartLiveliness(now, instructionsText.tooSlow, true)
      return
    }

    const result = evaluateGesture(gesture, pose, s.step)
    if (result === 'wrong') {
      console.log(`---------wrong movement while expecting ${gesture}`)
      restartLiveliness(now, instructionsText.wrongMovement, true)
      return
    }
    if (result !== 'pass') return

    console.log(`---------${gesture} detected`)
    s.stepIndex++
    s.step = newStepState(now)
    setCompletedSteps(s.stepIndex)


    if (s.stepIndex >= s.challenge.length) {
      s.done = true
      setLivelinessCheckDone(true)
      updateInstructions(instructionsText.done, instructionsText.holdStill, 'done')
    } else {
      updateInstructions(instructionsText.performActions,
        livelinessDetectionParam[s.challenge[s.stepIndex]].instruction, 'active')
    }
  }

  // Keep a single JS callback for the frame processor; it always calls the latest handler
  const handleDetectedFacesRef = useRef(handleDetectedFaces)
  handleDetectedFacesRef.current = handleDetectedFaces
  const onFacesDetected = useMemo(
    () => Worklets.createRunOnJS((faces, frameWidth, frameHeight, isMirrored) =>
      handleDetectedFacesRef.current(faces, frameWidth, frameHeight, isMirrored)),
    []
  )

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    const faces = detectFaces(frame)
    onFacesDetected(faces, frame.width, frame.height, frame.isMirrored)
  }, [detectFaces, onFacesDetected])


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


  const takePhoto = async () => {
    if (isCapturing.current) return
    isCapturing.current = true

    try {
      if (!camera.current) {
        console.error('Camera reference not available.', camera);
        return;
      }

      const photo = await camera.current.takePhoto();
      console.log(photo);

      if (photo) {
        console.log(`file://${photo.path}`)
        Speech.stop()
        setPhotoData(`file://${photo.path}`)
      } else {
        console.error('Photo captured is undefined or empty.');
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      // Let the user retry with the capture button
      session.current.captured = false
    } finally {
      isCapturing.current = false
    }

  };

  const onCameraReady = (ref) => {
    // Camera component is ready, set the camera reference
    camera.current = ref;// Reference to the Camera component (e.g., obtained from ref prop)
  };

  if (hasPermission === null) {
    return <Text style={styles.statusMessage}>Checking camera permission...</Text>;
  }

  if (!device) {
    return <Text style={styles.statusMessage}>No camera device available</Text>;
  }

  const ringColor = {
    failed: '#e53935',
    issue: '#ffa000',
  }[instructions.status] ?? '#2ecc40'
  const progressFill = livelinessCheckDone ? 100 : (completedSteps / CHALLENGE_LENGTH) * 100

  const captureDisabled = livelinessRequired && !livelinessCheckDone

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

          {livelinessRequired &&
            <View style={styles.ringOverlay} pointerEvents="none">
              <AnimatedCircularProgress
                size={ringSize}
                width={8}
                fill={progressFill}
                tintColor={ringColor}
                backgroundColor="rgba(255,255,255,0.35)"
                rotation={0}
                lineCap="round"
                duration={400}/>
              <Text style={styles.progressLabel}>
                {livelinessCheckDone ? 'Verified' : `${completedSteps} / ${CHALLENGE_LENGTH}`}
              </Text>
            </View>}
        </View>

        <View style={styles.instructionsContainer}>
          {livelinessRequired && <>
            <Text style={styles.instructions}>{instructions.highLevelInstruction}</Text>
            <Text style={[styles.action, instructions.status === 'failed' && styles.actionFailed]}>
              {instructions.actionToPerform}
            </Text>
          </>}
          {checkLocked &&
            <TouchableOpacity style={styles.retryButton} onPress={resetLiveliness}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </TouchableOpacity>}
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

            <TouchableOpacity
              style={[styles.shutter, captureDisabled && styles.shutterDisabled]}
              onPress={takePhoto}
              disabled={captureDisabled}
              accessibilityLabel="Take photo">
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideButton} onPress={flashModeHandler} accessibilityLabel="Toggle flash">
              <Ionicons name={ flashMode === "off" ? "flash-off-outline" : "flash-outline"} size={24} color={palette.onCamera} />
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
    statusMessage: {
      color: palette.onCamera,
      fontSize: 15,
      textAlign: 'center',
    },
    cameraContainer: {
      flex: 1,
      marginTop: cameraMarginTop,
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    top: {
      flex: 6,
    },
    ringOverlay: {
      ...StyleSheet.absoluteFillObject,
      top: cameraMarginTop,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressLabel: {
      position: 'absolute',
      bottom: 12,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: radius.pill,
      overflow: 'hidden',
      backgroundColor: 'rgba(0,0,0,0.6)',
      color: palette.onCamera,
      fontWeight: '600',
      fontSize: 13,
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
    shutterDisabled: {
      opacity: 0.35,
    },
    shutterInner: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: palette.onCamera,
    },
    instructionsContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
    },
    instructions: {
      fontSize: 15,
      textAlign: "center",
      color: palette.onCameraMuted,
    },
    action: {
      fontSize: 22,
      textAlign: "center",
      fontWeight: "700",
      color: palette.onCamera,
      marginTop: spacing.xs,
    },
    actionFailed: {
      color: '#F87171',
    },
    retryButton: {
      marginTop: spacing.md,
      paddingHorizontal: spacing.xl,
      paddingVertical: 10,
      borderRadius: radius.pill,
      backgroundColor: palette.onCamera,
    },
    retryButtonText: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 15,
    },
  });
