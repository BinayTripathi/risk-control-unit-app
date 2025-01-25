import { useState } from "react";
import RNTextDetector from "rn-text-detector";


const OCR = ({imageUri}) => {

    const [state, setState] = useState({
        loading: false,
        image: null,
        textRecognition: null,
        toast: {
        message: "",
        isVisible: false,
        },
       });


       async function onImageSelect(imageUri) {
        if (imageUri) {
         setState({ ...state, loading: false });
         return;
        }
        if (imageUri) {
         const file = imageUri; 
         const textRecognition = await RNTextDetector.detectFromUri(file);
        setState({
          ...state,
          textRecognition,
          image: file,
          toast: {
          message: matchText > -1 ? "Ohhh i love this company!!" : "",
          isVisible: matchText > -1, 
          },
          loading: false,
         });
       }}
}

export default OCR;