import { Text, ActivityIndicator } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../_app";
import { trpc } from "../utils/trpc";
import React from "react";
import { View } from "react-native";

type Props = NativeStackScreenProps<RootStackParamList, "ModifyAppliance">;

function ModifyAppliancePage({ navigation, route }: Props) {
  const { data: appliance, isLoading } = trpc.appliance.get.useQuery(
    route.params.applianceId
  );
  console.log(appliance);

  if (isLoading) {
    return (
      <View className="flex h-full items-center justify-center">
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }
  return <Text>Modify Appliance Page</Text>;
}

export default ModifyAppliancePage;
