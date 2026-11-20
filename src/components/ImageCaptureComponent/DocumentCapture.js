import React, { useEffect } from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import DocumentScanner from 'react-native-document-scanner-plugin'

import { PAGE_COUNT } from '@core/constants'

// Opens the scanner straight away; missing pages (e.g. the back side) are added from the preview
export default ({setPhotoData, pageCount = PAGE_COUNT.SINGLE}) => {
  const navigation = useNavigation()

  const scanDocument = async () => {
    // One scanner session can capture every page; MULTIPLE leaves the limit to the scanner default
    const { scannedImages } = await DocumentScanner.scanDocument({
      croppedImageQuality: 100,
      maxNumDocuments: pageCount === PAGE_COUNT.FRONT_BACK ? 2 : pageCount === PAGE_COUNT.MULTIPLE ? undefined : 1
    })

    // file uris, one per page in scan order; nothing scanned means the agent cancelled
    if (scannedImages?.length > 0) setPhotoData(scannedImages)
    else navigation.goBack()
  }

  useEffect(() => {
    scanDocument()
  }, [])

  return <View style={{flex: 1}} />
}
