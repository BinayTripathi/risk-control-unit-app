import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Modal, Portal } from 'react-native-paper';

const ModalComponent = ({children, diplayModal, displayMapHandler }) => {


  console.log(diplayModal)

  const dismissHandler = ()=> {
    displayMapHandler()
  }

  return (    
      <Portal>
        <Modal  visible={diplayModal} onDismiss={dismissHandler} contentContainerStyle={Styles.containerStyle} dismissable={true}>
          {children}
        </Modal>
      </Portal>         
  );
};

export default ModalComponent;

const Styles = StyleSheet.create({
  containerStyle:   {
    backgroundColor:'transparent', 
    marginHorizontal: 5
  }
})