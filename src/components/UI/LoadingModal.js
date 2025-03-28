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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    minHeight: 230,
    width: 280,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },
  image : {
    width: 70,
    height: 70,
    borderRadius: 70,        
    transform: [{ translateY: -30 }],
  },
 

});

