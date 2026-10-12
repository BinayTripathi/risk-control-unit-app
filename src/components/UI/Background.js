import React from 'react';
import { ImageBackground, StyleSheet, View, Dimensions, Modal, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@core/theme';
import Toast from 'react-native-root-toast';
import useNetworkInfo from '@hooks/useNetworkInfo';
import useLocationStatus from '@hooks/useLocationStatus';



export default function Background({children }) {

  const { width, height } = Dimensions.get('window');
  let [isNetworkConnected] = useNetworkInfo()
  const { isLocationEnabled, isPermissionGranted, isChecking } = useLocationStatus(5*1000);


  
  return (
    <LinearGradient
      colors={[theme.colors.gradientA, theme.colors.gradientB, theme.colors.gradientB,theme.colors.gradientC]}
      style={styles.rootContainer}
    >
     <Modal
        animationType="fade" // Options: 'slide', 'fade', or 'none'
        transparent={true} // Set true to see through the background
        visible={!isLocationEnabled} // Controls modal visibility
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.text}>Please turn on your location</Text>
          </View>
        </View>
      </Modal>

    
        <Toast
            visible={!isNetworkConnected}
            position={50}
            shadow={false}
            animation={true}
            duration={Toast.durations.SHORT}
            backgroundColor='red'
        >No Internet Connection</Toast>
      <ImageBackground
        source={require('../../../assets/backgroundimg.jpg')}
        resizeMode="cover"
        style={styles.rootContainer}
        imageStyle={styles.background}
      >
        <View style={styles.overlay} />
        <View style={[styles.container, { width, height }]} accessible={true}>          
            {children}          
        </View>
      </ImageBackground>
      </LinearGradient>
  )
}

const styles = StyleSheet.create({
  background: {
    opacity: 0.12, // Slightly more visible background image
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle white overlay for better contrast
  },
  rootContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  container: {    
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker dim background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 320,
    padding: 25,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#FF9933', // Saffron border for theme
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

})
