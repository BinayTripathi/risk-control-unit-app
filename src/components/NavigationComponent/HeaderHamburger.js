// components/Header.js
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export default function HeaderHamburger({ onPress }) {

  const onMenuPress = () => {
    // Logic to open the drawer or menu
    console.log('Menu button pressed'); 
    if (onPress) {
      onPress();
    }
  };

  return (
    <View style={styles.header}>
      

      <Pressable onPress={onMenuPress}>
        <AntDesign name="bars" size={30} color="black" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  icon: {
    fontSize: 28,
    color: '#fff',
  },
  title: {
    color: '#fff',
    fontSize: 20,
  },
});