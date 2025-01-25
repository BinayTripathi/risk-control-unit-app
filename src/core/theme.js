import { DefaultTheme } from 'react-native-paper'

export const theme1 = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: '#000000',
    primary: '#02032f',
    secondary: '#40c3f3',
    error: '#6b0214',
    gradientA: '#040112',
    gradientB: '#0e0e91',
    gradientC: '#9997fb'
  },
}

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: '#4a4646',
    subText: '#6d6666',
    primary: '#0a48f2',
    disabledPrimary: '#2e1a04',
    secondary: '#3687a5',
    error: '#6b0214',
    gradientA: '#f64e16',
    gradientB: '#dcdcf0',
    gradientC: '#022c13',
    shadowColor: '#3a3939',
    shadowColorAlt: '#7e0404',
    gradientALight: '#f57449',
    caseItemBackground : '#f5f4f4',
    title1Color :  '#f68e6e',
    title2Color: '#9cba81',
    borderSeperator : '#727070',
    lightBorderSeperator : '#f3ecec',
    LIGHT_BLUE: '#afd0ff',
    LIGHT_GOLD: '#e8d38f',
    LIGHT_RED: '#ff7e85',
    DARK_BLUE: '#4a64a8',
    DARK_GOLD: '#85692a',
    DARK_RED: '#992e1e',
    details_card_color:'#4367c9', //'#010313', //'#3b1818'  '#181818',
    button:  '#011313',
    button_label: 'white',
    submitButton : '#570235',//'#992e1e',
    disabledSubmitButton : '#ed978a',
    updateDetailsBackground: '#f8fbf8',
    capabilitiesCardBackgroundColor :  '#f5f4f4',
  }
}