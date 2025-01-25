import { View , StyleSheet } from "react-native"


export const Padder = ({children}) => {

    return <View style={styles.container}>
        {children}
    </View>
}


const styles = StyleSheet.create({

    container : {
      flex:1,
      width: '100%',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      overflow: 'hidden',
    }
})