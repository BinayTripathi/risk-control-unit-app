import React, {useState} from 'react';
import { StyleSheet, Text, Pressable, View, Image} from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import LottieView  from "lottie-react-native";

export default LoadingModalWrapper = (props) => {

  return (
    <View style={styles.centeredView}>
      <Portal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={props.shouldModalBeVisible}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
            <View><LottieView source={require("@root/loadingModal.json")} autoPlay loop style={{ height: 50 }} /></View>            
            </View>
          </View>
        </Modal>
      </Portal>     
      {props.children}
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    alignItems: 'center',  
  },
 

});

