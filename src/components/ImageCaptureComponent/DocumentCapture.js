import React, { useState, useEffect } from 'react'
import { Image, Platform, PermissionsAndroid, Alert, View, TouchableOpacity } from 'react-native'
import DocumentScanner , {ResponseType} from 'react-native-document-scanner-plugin'

export default ({setPhotoData}) => {
  const [scannedImage, setScannedImage] = useState(null);

  const scanDocument = async () => {
    
    // start the document scanner
    const { scannedImages } = await DocumentScanner.scanDocument({
     croppedImageQuality: 100,
     responseType : ResponseType.Base64,
     maxNumDocuments: 1
    })
  
    // get back an array with scanned image file paths
    if (scannedImages.length > 0) {
      // set the img src, so we can view the first scanned image
      setScannedImage(scannedImages[0])
      setPhotoData(scannedImages[0])
    }
  }

  useEffect(() => {
    // call scanDocument on load
    scanDocument()
  }, []);

  return (
    <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
       { scannedImage !== null && <Image style={{ width: '100%', height: '70%' }}  resizeMode='contain'  source={{ uri:  `data:image/jpg;base64,${scannedImage}` }}/>  }
       {false && <TouchableOpacity style={{
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'black',
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center'
       }}></TouchableOpacity> }
    </View>
   
    
  )
}