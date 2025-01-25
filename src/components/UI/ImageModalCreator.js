import { View, Image, Pressable, StyleSheet } from "react-native"
import ModalComponent from "./ModalComponent"
import { useState } from "react"

export default ImageModalCreator = ({image}) => {

    const [displayModal, setDisplayModal] = useState(false)

    const displayImageModalHandler = () => {
        setDisplayModal((displayModal) => !displayModal)
      }

const modalContent = displayModal ? (
    <ModalComponent displayMapHandler = {displayImageModalHandler}>
                <View style = {Styles.profilePhotoContainer} >
                    <Image style = {{width: 300, height: 300, borderRadius: 20}} source = {{uri:`${image}`}}/>
                </View>
            </ModalComponent>
) : (<Pressable  onPress={displayImageModalHandler}>
        
    <View style = {Styles.profilePhotoContainer} >
        <Image style = {{width: 40, height: 40, borderRadius: 20}} source = {{uri:`${image}`}}/>
    </View>
</Pressable>)

return modalContent
}

const Styles = StyleSheet.create({


profilePhotoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: '#93be6e',
    borderWidth: 2,
    shadowColor: "black",  
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation:8,
    margin: 10
  }

})