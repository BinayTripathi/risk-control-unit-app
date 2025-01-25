import { StyleSheet, View, Text, Pressable} from 'react-native';
import Card from './Card';
import { theme } from '@core/theme';

export default CircularButton = ({label , children, onPress, selectedTime}) => {

    return (

        <Pressable onPress={onPress}>
            <Card style = {styles.actionIconsContainer}>  
                <View style={styles.actionIcons}>
                    {children}
                </View>
                <Text style = {[styles.textBase ]}>{label}</Text>
            </Card>
        </Pressable>
    )
}

const styles = StyleSheet.create({


    actionIconsContainer: {
        backgroundColor: '#f8f7f4',
        aspectRatio: 1
      },
      actionIcons: {
        width: '70%',
        aspectRatio: 1,      
        borderRadius: 50,
        backgroundColor: 'rgba(250, 92, 7, 0.30)',
        alignItems: 'center',
        justifyContent: 'center'
      },
      textBase: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold'
      },
})