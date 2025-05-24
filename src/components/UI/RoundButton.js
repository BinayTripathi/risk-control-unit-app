import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { actuatedNormalize, actuatedNormalizeVertical } from "@core/PixelScaling";

const RoundButton = ({children, style, onPressHandler}) => (
    

    <TouchableOpacity style={[styles.button, style]} onPress={onPressHandler}>
        <View>
            {children}
        </View>  
    </TouchableOpacity>     

);

export default RoundButton;

const styles = StyleSheet.create({

  button: {
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    backgroundColor: '#fff',
    elevation: 2, // Android
    height:  actuatedNormalizeVertical(110),
    width: actuatedNormalize(100),
    borderRadius: actuatedNormalize(60),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});