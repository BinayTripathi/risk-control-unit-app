import { Text, StyleSheet } from 'react-native';
import { theme } from '@core/theme';

function Title({ children }) {
   
  return (<Text style={styles.title}>{children}</Text>);
}

export default Title;

const styles = StyleSheet.create({
  title: {
    //fontFamily: 'open-sans-bold',
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    borderWidth: 2,
    borderColor:"green",
    padding: 12,
  },
});