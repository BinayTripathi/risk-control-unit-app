import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Collapsible from 'react-native-collapsible';

const CollapsibleSection = ({ title, sectionComplete, children }) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <View style={styles.section}>
      <TouchableOpacity onPress={() => setCollapsed(!collapsed)} style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
        {sectionComplete && <Image source={require('@root/assets/checkmark.png')} style={styles.statusImage} />}
      </TouchableOpacity>
      <Collapsible collapsed={collapsed}>
        <View style={styles.content}>{children}</View>
      </Collapsible>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    width : '100%'
  },
  header: {
    backgroundColor: '#007bff',
    padding: 10,
    height: 50,
    alignItems: 'center'
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    backgroundColor: 'hidden',
  },
  statusImage : {
        width: 20,
        height: 20,
        borderRadius: 10,
        resizeMode: 'contain',
        transform: [{ translateX: 30 }, { translateY: -30 }],
      },
});

export default CollapsibleSection;