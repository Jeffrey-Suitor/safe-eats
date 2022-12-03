import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../_app";
import { trpc } from "../utils/trpc";
import React, { useEffect, useState } from "react";
import { SafeAreaView, View, ActivityIndicator } from "react-native";
import { styled } from "nativewind";
import useBLE from "../utils/useBLE";
import { applianceTypes } from "@safe-eats/types/applianceConstants";
import { capitalize } from "@safe-eats/helpers/stringHelpers";
import Base64 from "base-64";
import {
  ApplianceInfo,
  ApplianceInfoSchema,
} from "@safe-eats/types/applianceTypes";
import { TextInput, DropDown } from "../components/Inputs";
import { Button } from "../components/Buttons";

export type NavigationProps = NativeStackScreenProps<
  RootStackParamList,
  "ModifyAppliance"
>;

const StyledTextInput = styled(TextInput);
const StyledDropDown = styled(DropDown);

function ModifyAppliancePage({ navigation, route }: NavigationProps) {
  const { applianceId, modifyType } = route.params;
  const utils = trpc.useContext();

  const { data: appliance, isLoading } =
    trpc.appliance.get.useQuery(applianceId);

  const {
    allDevices,
    scan,
    requestPermissions,
    connect,
    connectedDevice,
    ServiceUuid,
    CharacteristicUuids,
  } = useBLE();

  const { mutate } = trpc.appliance.update.useMutation({
    async onSuccess(data) {
      utils.appliance.get.invalidate(data.id);
      if (!isConnected) {
        navigation.navigate("Appliances");
      }
    },
  });

  const [applianceInfo, setApplianceInfo] = useState<ApplianceInfo>({
    name: appliance?.name || "",
    ssid: "",
    pass: "",
    type: appliance?.type || applianceTypes[0],
  });

  const [formComplete, setFormComplete] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [showDropDown, setShowDropDown] = useState(false);

  useEffect(() => {
    const result = ApplianceInfoSchema.safeParse(applianceInfo);
    setFormComplete(result.success);
  }, [applianceInfo]);

  if (isLoading || !appliance) {
    return (
      <View className="flex h-full items-center justify-center">
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  useEffect(() => {
    requestPermissions((isGranted) => {
      if (isGranted) {
        scan();
      }
    });
  }, []);

  useEffect(() => {
    const desiredDevice = allDevices.find(
      (device) => device.id === appliance.BLEId
    );
    if (desiredDevice) {
      connect(desiredDevice);
    }
  }, [allDevices, appliance.BLEId]);

  const isConnected = connectedDevice?.id === appliance.BLEId;

  return (
    <SafeAreaView>
      <View className="h-full w-full p-4">
        <View className="flex grow items-stretch justify-center gap-4">
          <TextInput
            label="Appliance Name"
            value={applianceInfo.name}
            onChangeText={(name) =>
              setApplianceInfo({ ...applianceInfo, name })
            }
            errorText="Please enter an appliance name"
            showError={showErrors && applianceInfo.name === ""}
          />

          <DropDown
            label="Appliance Type"
            selectedOption={applianceInfo.type}
            options={applianceTypes as unknown as string[]}
            showDropDown={showDropDown}
            setShowDropDown={() => setShowDropDown(!showDropDown)}
            onChange={(text) => {
              const type = text as typeof applianceTypes[number];
              setApplianceInfo({ ...applianceInfo, type });
            }}
          />

          {isConnected && (
            <TextInput
              label="Wifi name"
              value={applianceInfo.ssid}
              onChangeText={(ssid) =>
                setApplianceInfo({ ...applianceInfo, ssid })
              }
              errorText="Please enter an wifi name"
              showError={showErrors && applianceInfo.ssid === ""}
            />
          )}

          {isConnected && (
            <TextInput
              label="Wifi password"
              value={applianceInfo.pass}
              onChangeText={(pass) =>
                setApplianceInfo({ ...applianceInfo, pass })
              }
              errorText="Please enter an wifi password"
              showError={showErrors && applianceInfo.pass === ""}
            />
          )}
        </View>
        <Button
          className={!formComplete ? "bg-gray-500" : ""}
          onPress={() => {
            if (!formComplete) {
              setShowErrors(true);
              return;
            }

            mutate({
              ...appliance,
              name: applianceInfo.name,
              type: applianceInfo.type,
            });

            if (isConnected) {
              connectedDevice
                .writeCharacteristicWithResponseForService(
                  ServiceUuid,
                  CharacteristicUuids.set_wifi_uuid,
                  Base64.encode(JSON.stringify(applianceInfo))
                )
                .then(() => {
                  navigation.navigate("Appliances");
                });
            }
          }}
        >
          {`${capitalize(modifyType)} Appliance`}
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default ModifyAppliancePage;
