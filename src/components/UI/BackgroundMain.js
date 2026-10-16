import { StyleSheet, View } from 'react-native'

import { palette } from '@core/theme';
import Toast from 'react-native-root-toast';
import useNetworkInfo from '@hooks/useNetworkInfo';


export default function Background({ children }) {

  let [isNetworkConnected] = useNetworkInfo()

  return (
    <View style={styles.rootContainer}>
        <Toast
            visible={!isNetworkConnected}
            position={50}
            shadow={false}
            animation={true}
            duration={Toast.durations.SHORT}
            backgroundColor={palette.danger}
        >No internet connection</Toast>
        <View style={styles.container}>
          {children}
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: palette.background,
  },
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  }
})
