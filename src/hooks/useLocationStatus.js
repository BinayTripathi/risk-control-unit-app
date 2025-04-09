import { useState, useEffect } from "react";
import * as Location from "expo-location";

const useLocationStatus = (checkInterval = 2000) => {
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true; // To prevent state updates if the component unmounts

    //Function to check for permission
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted" && isMounted) {
          // Prompt the user to grant permissions via settings
          Alert.alert(
            "Location Permission Required",
            "Location access is needed to use this feature. Please enable location permissions in your settings.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
        }
        if (isMounted) setIsPermissionGranted(status === "granted");
      } catch (error) {
        console.error("Error requesting location permission:", error);
      }
    };



    const checkLocationServices = async () => {
      try {
        // Check if location services are enabled
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (isMounted) setIsLocationEnabled(servicesEnabled);

        // Request or check foreground location permissions
        await requestLocationPermission();
      } catch (error) {
        console.error("Error checking location status:", error);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    };

    // Initial check
    checkLocationServices();

    // Periodic checks
    const intervalId = setInterval(() => {
      checkLocationServices();
    }, checkInterval); // Check every `checkInterval` ms

    // Stop checking when the component unmounts
    return () => {
      isMounted = false;
      clearInterval(intervalId);
      setIsChecking(false); // Mark as no longer checking
    };
  }, [checkInterval]);

  return { isLocationEnabled, isPermissionGranted, isChecking };
};

export default useLocationStatus;
