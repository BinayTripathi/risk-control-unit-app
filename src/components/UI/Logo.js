import { View, Image, StyleSheet } from 'react-native'

export default function Logo() {
  return <View style={styles.imageContainer} >
    <Image source={require('@root/assets/icheckifylogo.png')} style={styles.image} />
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
