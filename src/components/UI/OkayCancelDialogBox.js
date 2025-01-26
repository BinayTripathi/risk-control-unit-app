import {View, Text, StyleSheet, Image, Animated} from 'react-native'
import { Modal, Portal } from 'react-native-paper';
import { Surface, Divider} from 'react-native-paper'
import Button from '@components/UI/Button'


const OkayCancelDialogBox = ({showDialog, setShowDialog, title, content, okayHandler, cancelHandler}) => {

    const dismissHandler = () => {
        setShowDialog(false)
        cancelHandler()
    }

    const approveHandler = () => {
        setShowDialog(false)
        okayHandler()
    }

    return (
        
        <Portal>
            <Modal  visible={showDialog} onDismiss={dismissHandler} contentContainerStyle={styles.containerStyle} dismissable={true} >            
                <Surface style={[styles.surface]}>
                    <View style={{alignItems: 'center', height: 1,       color: '#e96969'}}>
                        <Image source={require('@root/assets/green_question.jpg')} style={styles.image} />  
                    </View>                  
                                      

                    <View style={{marginTop: 30, marginBottom: 30, minWidth: 250}}>        
                        <Text style={styles.title}>{title}</Text>                
                        <Divider bold={true}/>
                    </View>
                    <View>
                        <Text style={styles.content}>{content}</Text>                        
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 20}}>
                       
                        <View style={{padding: 10}}>
                            <Button mode="elevated" style={[styles.button, styles.okButton]} onPress={() => approveHandler()}> 
                                <Text style={{color: 'black'}}>OK</Text> </Button>
                        </View>

                        <View style={{padding: 10}}>
                            <Button mode="elevated" style={[styles.button, styles.cancelButton]} onPress={() => dismissHandler()}>
                            <Text style={{color: 'black'}}>CANCEL</Text> </Button>
                        </View>
                    </View> 
                </Surface>             
            </Modal>
        </Portal> 
       
    )
}

export default OkayCancelDialogBox

const styles = StyleSheet.create({
    containerStyle:   {
        backgroundColor:'transparent', 
        marginHorizontal: 5,
        alignItems: 'center'
      },
    surface: {
      minHeight: 230,
      width: 280,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'left',
      },
      content: {
        fontSize: 18,
        color: 'black',
        textAlign: 'left',
      },
      image : {
        width: 70,
        height: 70,
        borderRadius: 70,        
        transform: [{ translateY: -30 }],
      },
      button: {
        marginRight: 5,
        marginBottom: 1
      },
      okButton: {
        backgroundColor: '#80b526',
        paddingHorizontal: 15,
        opacity: 0.7
      },
      cancelButton: {
        backgroundColor: '#e26221',
        opacity: 0.7
      },
  });