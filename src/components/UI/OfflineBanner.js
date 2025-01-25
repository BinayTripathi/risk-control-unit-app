import { View, Text } from "react-native";
import useNetworkInfo from "../../hooks/useNetworkInfo";


export default OfflineBanner = () => {
    const [isOffline] = useNetworkInfo();
  
    if (!isOffline) {
      return (
        <View>
          <View >
            <Text>You are currently offline</Text>
          </View>
        </View>
      );
    }
    return <></>;
  };