import { RootStackParamList } from "../_app";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import React, { useState, useEffect } from "react";
import { SafeAreaView, View } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Button, Text } from "react-native-paper";
import { defaultAppliance } from "@safe-eats/types/applianceTypes";

type Props = NativeStackScreenProps<RootStackParamList, "Scan">;

function ScanPage({ route, navigation }: Props) {
  const { scanType } = route.params;
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const onScanned = ({ data }: { data: string }) => {
    setScanned(true);
    switch (scanType) {
      case "qr-code":
        navigation.navigate("AssignQrCode", { qrCode: data });
        break;
      case "appliance":
        navigation.navigate("ModifyAppliance", {
          appliance: defaultAppliance,
          modifyType: "add",
        });
        break;
      default:
        throw new Error(
          `ScanPage: Invalid scanType: ${scanType}. Expected "qr-code" or "appliance".`
        );
    }
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
          onBarCodeScanned={scanned ? undefined : onScanned}
          className="grow"
        />
        <Button mode="contained" onPress={() => navigation.pop()}>
          Cancel Scan
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default ScanPage;
