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
  const { isLocationEnabled, isPermissionGranted, isChecking } = useLocationStatus(300*1000);


  
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

          <View style={[styles.container, { width, height }]} accessible={true}>          
              {children}          
          </View>

        
         
        
      </ImageBackground>
      </LinearGradient>
  )
}

const styles = StyleSheet.create({
  background: {
    opacity: 0.08,
  },
  rootContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#d76969',
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold'
  },

})
