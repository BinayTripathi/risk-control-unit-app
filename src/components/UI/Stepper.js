import * as React from "react";
import { View, Text, StyleSheet } from "react-native";

const Stepper = ({stepComplete}) => {
   
    const contents = [
    <Text>Content 1</Text>,
    <Text>Content 2</Text>,
    <Text>Content 3</Text>,
    ]

  return (
    <View>
      <View style={stylesStepper.content}>
        {contents.map((_, i) => {
          return (
            <React.Fragment key={i}>
              { i !== 0 && (<View style={stylesStepper.stepBackground} />)}
              <View style={[stylesStepper.step, stepComplete < i ? {opacity: 0.5} : {}]}>
                <Text style={stylesStepper.stepText}>{i+1}</Text>
              </View>
              { i !== contents.length-1 && <View style={{height: 1, minWidth:50, backgroundColor: 'black', margin: 5}}></View> }
            </React.Fragment>
          )
        })}
      </View>
    </View>
  );
};

export default Stepper

const stylesStepper = StyleSheet.create({
    content: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center"
    },
    stepBackground: {
      flex: 1,
      height: 1,
      backgroundColor: "black",
      opacity: 1,
      marginHorizontal: 0
    },
    step: {
      backgroundColor: "#1976d2",
      width: 40,
      height: 40,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    stepText: {
      color: "white"
    }
  });