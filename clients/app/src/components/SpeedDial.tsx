import { IconButton } from "react-native-paper";
import { RootStackParamList } from "../_app";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { defaultRecipe } from "@safe-eats/types/recipeTypes";
import { View, Text, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type NavigationProps =
  | NativeStackScreenProps<RootStackParamList, "Appliances">
  | NativeStackScreenProps<RootStackParamList, "Recipes">;

interface SpeedDialProps {
  navigation: NavigationProps["navigation"];
}

const StyledIconButton = styled(IconButton);

function SpeedDial({ navigation }: SpeedDialProps) {
  const [open, setOpen] = useState(false);

  const openButtons = open
    ? [
        {
          icon: "qrcode-scan",
          label: "Scan QR Code",
          onPress: () => navigation.push("Scan", { scanType: "qr-code" }),
        },
        {
          icon: "chef-hat",
          label: "Add Recipe",
          onPress: () =>
            navigation.push("ModifyRecipe", {
              recipe: defaultRecipe,
              modifyType: "add",
            }),
        },
        {
          icon: "toaster-oven",
          label: "Add Appliance",
          onPress: () => navigation.push("Scan", { scanType: "appliance" }),
        },
        {
          icon: "close",
          label: "",
          onPress: () => setOpen(false),
        },
      ]
    : [
        {
          icon: "plus",
          label: "",
          onPress: () => setOpen(true),
        },
      ];

  return (
    <View className="absolute bottom-0 right-0 m-4 flex gap-2">
      {openButtons.map((buttonValues) => {
        return (
          <TouchableOpacity className="flex flex-row items-center justify-end align-middle">
            {buttonValues.label && (
              <Text className="bg-red mr-2 p-2 shadow-sm shadow-stone-400">
                {buttonValues.label}
              </Text>
            )}

            <MaterialCommunityIcons.Button
              className="shadow-stone-40 rounded-2xl bg-primary p-3 shadow-lg"
              size={30}
              name={buttonValues.icon as any}
              onPress={buttonValues.onPress}
              backgroundColor="#FFFFFF00"
              underlayColor="#FFFFFF00"
              borderRadius={0}
              iconStyle={{
                marginRight: 0,
              }}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default SpeedDial;
