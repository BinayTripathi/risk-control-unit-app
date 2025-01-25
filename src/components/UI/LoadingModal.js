import React, {useState} from 'react';
import {Alert, Modal, StyleSheet, Text, Pressable, View, Image} from 'react-native';
import LottieView  from "lottie-react-native";

export default LoadingModalWrapper = (props) => {

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={props.shouldModalBeVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View><Image source={require("@root/assets/loading.gif")} autoPlay loop style={{ height:70, width: '30%'    }} /></View>            
          </View>
        </View>
      </Modal>
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

