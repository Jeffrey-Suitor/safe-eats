import { RootStackParamList } from "../_app";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { defaultRecipe } from "@safe-eats/types/recipeTypes";
import { View, Text, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import IconButton from "./IconButton";

export type NavigationProps =
  | NativeStackScreenProps<RootStackParamList, "Appliances">
  | NativeStackScreenProps<RootStackParamList, "Recipes">;

interface SpeedDialProps {
  navigation: NavigationProps["navigation"];
}

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
              <Text className="mr-2 p-3 shadow-sm shadow-stone-400">
                {buttonValues.label}
              </Text>
            )}
            <IconButton
              classes="shadow-stone-40 rounded-2xl bg-orange-400 p-3 shadow-lg"
              size={30}
              icon={buttonValues.icon as any}
              onPress={buttonValues.onPress}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default SpeedDial;
