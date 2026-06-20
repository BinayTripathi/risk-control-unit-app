import NetInfo from '@react-native-community/netinfo';
import { offlineActionCreators } from 'react-native-offline';
import store from '@store'


const measureNetworkSpeed = async () => {
  const startTime = Date.now();
  try {
    const response = await fetch("https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_92x30dp.png");
    const endTime = Date.now();

    const fileSize = response.headers.get("content-length") || 5000; // Approximate size in bytes
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    const speedMbps = (fileSize / duration) / (1024 * 1024); // Convert to Mbps

    return speedMbps;
  } catch (error) {
    console.error("Speed test failed:", error);
    return 0; // Assume offline if speed test fails
  }
};

export const monitorNetworkQuality = () => {
  NetInfo.addEventListener(async (state) => {

    const isConnectedSelector = state => state.network.isConnected;
    const cellularGen = state.details?.cellularGeneration;
    const isGoodNetwork = state.isConnected && state.isInternetReachable;


    // Measure speed
    const speedMbps = await measureNetworkSpeed();
    console.log(`Network Speed: ${speedMbps.toFixed(2)} Mbps`);

    // Consider offline if speed < 1 Mbps or on slow cellular (2G/3G)
    const isOnline = isGoodNetwork && speedMbps >= 1;
   
    console.log(`Is device online - hardcheck :  ${isOnline}`)

    // Dispatch changeNetwork action to update isConnected in offline reducer
    const { connectionChange } = offlineActionCreators;
    store.dispatch(connectionChange(isOnline));
  });
};
