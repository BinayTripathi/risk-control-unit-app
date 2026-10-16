import React, {useState} from 'react';
import { StyleSheet, Text, Pressable, View, Image} from 'react-native';
import { Provider, Modal, Portal, Surface } from 'react-native-paper';
import LottieView  from "lottie-react-native";

export default LoadingModalWrapper = ({shouldModalBeVisible, children}) => {

  const dismissHandler = () => {
    setShowDialog(false)
    cancelHandler()
}

const approveHandler = () => {
    setShowDialog(false)
    okayHandler()
}

console.log(shouldModalBeVisible)

  return (
    <View style={styles.centeredView}>
      <Provider>
        <Portal>
          <Modal  visible={shouldModalBeVisible} onDismiss={dismissHandler} contentContainerStyle={styles.containerStyle} dismissable={true}  
            animationType="slide"
            transparent={true}
            >
            <View style={[styles.surface]}>
                    <Image source={require('@root/assets/loading.gif')} style={styles.image} />                  
            </View>
          </Modal>
      </Portal>     
      {children}
      </Provider>
      
    </View>
  );
};

const styles = StyleSheet.create({
  // Children must stretch: Paper's Provider wraps them in a flex:1 View with no width,
  // which collapses to content width under alignItems:'center'. The spinner itself renders in a Portal.
  centeredView: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  containerStyle:   {
    backgroundColor:'transparent', 
    marginHorizontal: 5,
    alignItems: 'center'
  },
  modalView: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    alignItems: 'center',  
  },

  surface: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  image : {
    width: 56,
    height: 56,
  },
 

});

