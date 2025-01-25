//import RNSecureStorage, { ACCESSIBLE } from 'rn-secure-storage'
//import EncryptedStorage from 'react-native-encrypted-storage';
import * as SecureStore from 'expo-secure-store';

export const secureSave = async (key, value) => {
    
    /*RNSecureStorage.set(key, value, {accessible: ACCESSIBLE.WHEN_UNLOCKED})
    .then((res) => {
    console.log(res);
    }, (err) => {
    console.log(err);
    });*/
    console.log(key + "____" + value)
    await SecureStore.setItemAsync(key,value);
}

/*export const secureGet = async (key) => {
    try{
    let val = await RNSecureStorage.get(key)
    return val
    } catch( err) {
        console.log(err)
    }

}*/

export const secureGet = async (key) => {
    //return RNSecureStorage.get(key).then((res) => {
    return await SecureStore.getItemAsync(key).then((res) => {
        return res
    }).catch((err) => {
        console.log(err);
    });
}

export const secureRemove = (key) => {
    SecureStore.deleteItemAsync(key).then((val) => {
        console.log(val)
        }).catch((err) => {
        console.log(err)
        });
}