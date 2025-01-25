import { manipulateAsync,FlipType,  SaveFormat } from 'expo-image-manipulator';

export  default  ImageCompressor = async (base64Image) =>  {
    const manipResult = await manipulateAsync(
        `data:image/jpeg;base64,${base64Image}`,
        [],
        { compress: 0, format: SaveFormat.PNG}
      );
      return manipResult
       
}