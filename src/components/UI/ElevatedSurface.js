import { Surface } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { actuatedNormalize, actuatedNormalizeVertical, isTab } from "@core/PixelScaling";

const FormAudioVideoPart = ({children, style}) => (
  <Surface style={[styles.surface, style]} elevation={4}>
    {children}
  </Surface>
);

export default FormAudioVideoPart;

const styles = StyleSheet.create({
  surface: {
    flexDirection: 'row',
    padding: 8,
    minHeight: actuatedNormalizeVertical(100),
    width: actuatedNormalize(300),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  }
});