import {
  Text,
  ActivityIndicator,
  TextInput,
  HelperText,
  Button,
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../_app";
import { trpc } from "../utils/trpc";
import React, { useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";
import { styled } from "nativewind";
import useBLE from "../utils/useBLE";
import { applianceTypes } from "@safe-eats/types/applianceConstants";
import DropDown from "react-native-paper-dropdown";
import { capitalize } from "@safe-eats/helpers/stringHelpers";
import Base64 from "base-64";
import {
  ApplianceInfo,
  ApplianceInfoSchema,
} from "@safe-eats/types/applianceTypes";

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

  const { mutate } = trpc.appliance[modifyType].useMutation({
    async onSuccess() {
      utils.appliance.all.invalidate();
      navigation.navigate("Appliances");
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
  const { allDevices, scan, requestPermissions, connect, connectedDevice } =
    useBLE();

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
          <View>
            <StyledTextInput
              label="Appliance Name"
              placeholder={appliance.name}
              onChangeText={() => {
                setApplianceInfo((prev) => {
                  return { ...prev, name: appliance.name };
                });
              }}
            />
            <HelperText
              type="error"
              visible={showErrors && applianceInfo.name === ""}
            >
              Please enter an appliance name
            </HelperText>
          </View>

          <View>
            <StyledDropDown
              label="Appliance"
              mode={"flat"}
              visible={showDropDown}
              showDropDown={() => setShowDropDown(true)}
              onDismiss={() => setShowDropDown(false)}
              value={applianceInfo.type}
              setValue={(value) =>
                setApplianceInfo((prev) => {
                  return { ...prev, type: value };
                })
              }
              list={applianceTypes.map((val) => {
                return { label: val.replace("_", " "), value: val };
              })}
            />
            <HelperText
              type="error"
              visible={showErrors && applianceInfo.type !== "Toaster_Oven"}
            >
              Please select an appliance type
            </HelperText>
          </View>

          {isConnected && (
            <View>
              <StyledTextInput
                label="Wifi Name"
                onChangeText={(text) => {
                  setApplianceInfo((prev) => {
                    return { ...prev, ssid: text };
                  });
                }}
              />
              <HelperText
                type="error"
                visible={showErrors && applianceInfo.ssid === ""}
              >
                Please enter a wifi password
              </HelperText>
            </View>
          )}

          {isConnected && (
            <View>
              <StyledTextInput
                label="Wifi Password"
                onChangeText={(text) => {
                  setApplianceInfo((prev) => {
                    return { ...prev, pass: text };
                  });
                }}
              />
              <HelperText
                type="error"
                visible={showErrors && applianceInfo.pass === ""}
              >
                Please enter an appliance name
              </HelperText>
            </View>
          )}
        </View>
        <Button
          mode="contained"
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
                .writeCharacteristicWithoutResponseForService(
                  (0x180a).toString(),
                  (0x0000).toString(),
                  Base64.encode(JSON.stringify(applianceInfo))
                )
                .then(() => {
                  navigation.navigate("Appliances");
                });
            } else {
              navigation.navigate("Appliances");
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
