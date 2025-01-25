import { Text, View, StyleSheet } from "react-native";


import { theme } from "@core/theme";

export default function Card({children, style}) {

    return (<View style={[styles.card, style]}>{children}</View>)
}

const styles = StyleSheet.create({
   /* card: {
      justifyContent: 'center',
      alignItems: 'center',
      //marginTop: deviceWidth < 380 ? 18 : 36,
      backgroundColor: theme.colors.caseItemBackground,
      borderRadius: 15,
      elevation: 4,
      shadowOffset: { width: 1, height: 1 },
      shadowColor: '#333',
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },*/
    card: {
      backgroundColor: theme.colors.caseItemBackground,
        borderRadius: 15,
        padding: 16,
        shadowColor: theme.colors.shadowColorAlt, 
               
        justifyContent: 'center',
        alignItems: 'center',

       
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 15,
        
        elevation: 6,
    }
  });