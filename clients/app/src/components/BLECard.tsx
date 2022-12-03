import React, { useEffect } from "react";
import { View, Text } from "react-native";
import useBLE from "../utils/useBLE";
import { Button } from "./Buttons";

function BLECard() {
  const {
    requestPermissions,
    scan,
    allDevices,
    connect,
    connectedDevice,
    disconnect,
  } = useBLE();

  useEffect(() => {
    requestPermissions((isGranted) => {
      if (isGranted) {
        scan();
      }
    });
  }, []);

  return (
    <View className="flex flex-col items-center justify-center">
      {allDevices.map((device) => {
        return (
          <View
            className="flex flex-col items-center justify-center"
            key={device.id}
          >
            <Text className="text-center">{device.name}</Text>
            <Button
              onPress={() => {
                if (connectedDevice && connectedDevice.id !== device.id) {
                  disconnect();
                  connect(device);
                }
              }}
            >
              Connect
            </Button>
          </View>
        );
      })}
    </View>
  );
}

export default BLECard;
