import { ImageBackground, StyleSheet, View, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@core/theme';
import Toast from 'react-native-root-toast';
import useNetworkInfo from '@hooks/useNetworkInfo';


export default function Background({ children }) {

  const { width, height } = Dimensions.get('window');
  let [isNetworkConnected] = useNetworkInfo()
  
  return (
    <LinearGradient
      colors={[theme.colors.gradientA, theme.colors.gradientB, theme.colors.gradientB,theme.colors.gradientC]}
      style={styles.rootContainer}
    >
     
    
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
        <View style={[styles.container, { width, height }]}>
          {children}
        </View>
         
        
      </ImageBackground>
      </LinearGradient>
  )
}

const styles = StyleSheet.create({
  background: {
    opacity: 0.085,
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
  }
})
