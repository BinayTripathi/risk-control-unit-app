import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { palette, spacing } from '@core/theme';

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
              <View style={[stylesStepper.step, stepComplete < i && stylesStepper.stepUpcoming]}>
                <Text style={[stylesStepper.stepText, stepComplete < i && stylesStepper.stepTextUpcoming]}>{i+1}</Text>
              </View>
              { i !== contents.length-1 && <View style={[stylesStepper.connector, stepComplete > i && stylesStepper.connectorDone]} /> }
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
      alignItems: "center",
      marginVertical: spacing.lg,
    },
    connector: {
      height: 2,
      width: 48,
      marginHorizontal: spacing.sm,
      backgroundColor: palette.border,
    },
    connectorDone: {
      backgroundColor: palette.primary,
    },
    step: {
      backgroundColor: palette.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    stepUpcoming: {
      backgroundColor: palette.surface,
      borderWidth: 1.5,
      borderColor: palette.border,
    },
    stepText: {
      color: palette.onPrimary,
      fontWeight: '700',
    },
    stepTextUpcoming: {
      color: palette.muted,
    },
  });
