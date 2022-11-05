import { SafeAreaView, View } from "react-native";
import React from "react";
import { RootStackParamList } from "../_app";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HomeSpeedDial from "../components/HomeSpeedDial";

type Props = NativeStackScreenProps<RootStackParamList, "Appliances">;

export const Appliances = ({ navigation }: Props) => {
  return (
    <SafeAreaView>
      <View className="h-full w-full p-4">
        <HomeSpeedDial navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};
