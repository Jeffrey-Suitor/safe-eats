/* eslint-disable no-bitwise */
import { useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";
import { PERMISSIONS, requestMultiple } from "react-native-permissions";
import DeviceInfo from "react-native-device-info";
import Base64 from "base-64";

const bleManager = new BleManager();
export const ServiceUuid = "0000180a-0000-1000-8000-00805f9b34fb";
export const CharacteristicUuids = {
  set_wifi_uuid: "00000000-0000-1000-8000-00805f9b34fb",
};

type VoidCallback = (result: boolean) => void;

interface BluetoothLowEnergyApi {
  requestPermissions(cb: VoidCallback): Promise<void>;
  scan(): void;
  connect: (deviceId: Device) => Promise<void>;
  disconnect: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  ServiceUuid: string;
  CharacteristicUuids: {
    set_wifi_uuid: string;
  };
}

function useBLE(): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  const requestPermissions = async (cb: VoidCallback) => {
    if (Platform.OS === "android") {
      const apiLevel = await DeviceInfo.getApiLevel();

      if (apiLevel < 31) {
        await bleManager.enable();
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonNeutral: "Ask Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]);

        const isGranted =
          result["android.permission.BLUETOOTH_CONNECT"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.BLUETOOTH_SCAN"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.ACCESS_FINE_LOCATION"] ===
            PermissionsAndroid.RESULTS.GRANTED;

        cb(isGranted);
      }
    } else {
      cb(true);
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scan = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        return;
      }

      if (!device || !device.manufacturerData) {
        return;
      }

      if (Base64.decode(device.manufacturerData) !== "SafeEats") {
        return;
      }

      setAllDevices((prevState: Device[]) => {
        if (!isDuplicteDevice(prevState, device)) {
          return [...prevState, device];
        }
        return prevState;
      });
    });

  const connect = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id, {
        requestMTU: 512,
      });
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
    }
  };

  const disconnect = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
    }
  };

  return {
    scan,
    requestPermissions,
    connect,
    allDevices,
    connectedDevice,
    disconnect,
    ServiceUuid,
    CharacteristicUuids,
  };
}

export default useBLE;
