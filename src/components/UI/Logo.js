import { View, Image, StyleSheet } from 'react-native'
import Constants from 'expo-constants'

export default function Logo() {
  // Derive APP_OWNER from baseURL since Constants doesn't expose APP_OWNER directly
  const baseURL = Constants.expoConfig?.extra?.baseURL || ''
  const appOwner = baseURL.includes('policy-intel') ? 'policyIntel' : 'icheckify'
  console.log('Logo - Derived APP_OWNER:', appOwner)
  console.log('Logo - baseURL:', baseURL)
  
  // Select logo based on APP_OWNER
  const logoSource = appOwner === 'policyIntel' 
    ? require('@root/assets/policyintellogo.jpeg')
    : require('@root/assets/icheckifylogo.png')
  
  return <View style={styles.imageContainer} >
    <Image source={logoSource} style={styles.image} />
  </View> 
}

const styles = StyleSheet.create({
  imageContainer: {
    width: 250,
    height: 200, 
    borderRadius: 150,
  },
  image : {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  }
})
