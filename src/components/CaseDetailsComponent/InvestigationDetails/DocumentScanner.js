import { StyleSheet,View, Text , Dimensions, TouchableHighlight, Image} from 'react-native';
import Card from '@components/UI/Card';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import { SCREENS, DOC_TYPE, checkLoading, checkSuccess } from '@core/constants';
import * as Speech from 'expo-speech';


const { width, height } = Dimensions.get('window');
const iconSize = 50;
const DocumentScanner = ({selectedClaimId, userId, caseUpdates}) => {

  const navigation = useNavigation();

  const onClickDigitalId = (documentObj) => {

    navigation.navigate(SCREENS.ImageCaptureScreen, {
        docType: documentObj,
        claimId: selectedClaimId,
        email: userId})
}

const speechHandler = (documentObj) => {
  Speech.speak(documentObj.speach);
};

  let capabilities = DOC_TYPE.DOCUMENT_SCANNER.map((documentType, index)=> {  

    let panValid = caseUpdates !== undefined && Object.keys(caseUpdates).includes(documentType.name) === true ? 
    (caseUpdates[documentType.name].panValid === ''? false : caseUpdates[documentType.name].panValid ) : false

        return(
            <Card style = {[styles.card, documentType?.enabled !== true? styles.cardDisabled: {}]}  key={index}>

              <TouchableHighlight onPress={()=> speechHandler(documentType)}  style={styles.button} underlayColor="#a2a1a0">
                  <View style = {styles.labelContainer}>
                      <Text style = {[styles.textBase , styles.label]}>{documentType.name} </Text>                    
                      <Ionicons name='volume-medium' size={iconSize-30} color="orange" /> 
                  </View>                
              </TouchableHighlight>  

              <View style= {styles.allIconContainerRow} >            

                  <View style={{alignContent: 'center', alignItems: 'center'}}>
                  <TouchableHighlight underlayColor="#ee5e33"  style={styles.touchable}
                      disabled =  {documentType?.enabled == true ? false: true}
                      onPress={()=> onClickDigitalId(documentType)}>
                          <View style= {[styles.eachIconContainer,  documentType?.enabled == true ? {} : styles.disabled]}>

                              { checkLoading(documentType, caseUpdates) && <Image source={require('@root/assets/loading.gif')} style={styles.statusImage} /> }
                              { checkSuccess(documentType, caseUpdates) && <Image source={require('@root/assets/checkmark.png')} style={styles.statusImage} /> }                        

                              <View style={styles.imageContainer} >
                                <Image source={{uri:`${documentType.icon}`}} style={styles.iconImage} />
                              </View>                              
                          
                          </View>
                          
                      </TouchableHighlight>   
                      
                  
                  </View>     

                  <View style={styles.verticalSeperator}>
                  </View>
                 

                  {documentType?.enabled === true && checkSuccess(documentType, caseUpdates) &&
                    <View style={styles.resultContainer}>
                        <View style={styles.resultImageContainer}>
                            <Image style = {[styles.image,panValid === false? {borderColor: 'red'} :{}]} 
                                source = {{uri:`data:image/jpeg;base64,${caseUpdates[documentType.name].OcrImage}`}}/>               
                        </View>
                        <View style= {styles.resultStatusContainer}>
                            { checkSuccess(documentType, caseUpdates) &&
                            <Text style = {[styles.textBase , styles.resultStatusLabel, panValid === false? styles.resultStatusLabelFail: {}]}>{documentType.name} Check</Text> }
                            { checkSuccess(documentType, caseUpdates) &&
                            <Text style = {[styles.textBase , styles.resultStatusLabel, panValid === false? styles.resultStatusLabelFail: {}]}>{panValid === false? 'FAIL' : 'PASS'}</Text> }
                        </View>
                        </View>
                 }
                  

                      {(documentType?.enabled !== true || 
                      (documentType?.enabled === true &&  !checkSuccess(documentType, caseUpdates))) && 
                      <View style={{width: '60%', alignItems: 'center', justifyContent: 'center'}}>
                          <Image style = {{width: 100, height: 70, borderRadius: 10}} source={require('@root/assets/noimage.png')}/>
                      </View> }
                      


              </View>
            </Card>
      )
   
  })

  return (
    <View style =  {styles.capabilityCardContainer}>                
        {capabilities}
  </View>  
)
}

const styles = StyleSheet.create({

  capabilityCardContainer : {      
    marginTop: 0,          
    alignContent: 'center',
    alignItems: 'center'       
    },   
    descriptionContainer : {
      marginBottom: 40,        
    } ,

    description: {
      fontSize: 28,
      fontWeight: 'bold',
      textShadowColor: 'rgba(22, 6, 96, 0.75)',
      textShadowOffset: {width: 1, height: 1},
      textShadowRadius: 20,
    },  
  card : { 
      alignItems: 'center', 
      padding: 10, 
      marginBottom: 10,
      width: width*0.80,
      //backgroundColor: theme.colors.caseItemBackground
      //backgroundColor: theme.colors.capabilitiesCardBackgroundColor,
      backgroundColor: theme.colors.details_card_color
  },
  cardDisabled: {
    opacity: 0.5
  },
  allIconContainerRow : {
    flexDirection: 'row',
    marginTop: 10,
    alignContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  eachIconContainer : {       
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'orange',
    borderRadius: 20,
    width: 70,
    height: 70,
    marginHorizontal: 20        
  },
  buttonContainer: {

   
}, 
  labelContainer : {
    flexDirection: 'row',
    borderRadius: 10,
    borderBottomWidth: 2,
    padding: 2,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'orange',
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#eae6e6'
  },
  imageContainer: {
    position: 'absolute',
    width: 60,
    height: 60, 
    borderRadius: 25,
    alignItems: 'center'
  },
  iconImage : {
    flex: 1,
    width: '90%',
    height: '90%',
    borderRadius: 30,
    resizeMode: 'contain',

  },
  touchable: {
      borderRadius: 8,
      elevation: 10,
      
      alignItems: 'center',
      width: 70,
      height: 70,
      marginHorizontal: 20
    },
  textBase: {
      color: 'black',
      textAlign: 'center'
  },
  capabilityDescription: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  label: {
    fontWeight: '500',
    fontSize: 18,
    color: 'white'
 },  
  statusImage : {
    width: 20,
    height: 20,
    borderRadius: 10,
    resizeMode: 'contain',
    transform: [{ translateX: 30 }, { translateY: -30 }],
  },

  verticalSeperator: {
    width: 2, 
    paddingVertical: 30, 
    borderWidth: 1, 
    borderColor: '#b5b1b1',
    marginRight: 10
  },
  resultContainer : {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 2,
    backgroundColor: '#E18A07'
},
resultImageContainer : {
  borderColor: 'orange',
  borderRadius: 5,
  width: 50,
  height: 50,
  borderWidth:2,
},
image : {
  width: '99%',
  height: '99%',
  borderWidth: 2,
  borderColor: 'green'
},
resultStatusContainer : {
  flexDirection: 'column',
  alignSelf: 'center',
  marginLeft: 10,
},
resultStatusLabel : {
  fontWeight: '800',
  fontSize: 15,
  color: 'green',
  width : 85,
},
resultStatusLabelFail : {
  color: 'red'
}
})

  export default DocumentScanner;