import { RootStackParamList } from "../_app";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, View, Button } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

type Props = NativeStackScreenProps<RootStackParamList, "Scan">;
export const Scan = ({ route, navigation }: Props) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaView>
      <View className="h-full w-full p-4">
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          className="absolute w-full h-full"
        />
        {scanned && (
          <Button
            title={"Tap to Scan Again"}
            onPress={() => setScanned(false)}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
