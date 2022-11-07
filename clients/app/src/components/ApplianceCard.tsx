import { View } from "react-native";
import { Surface, Text, TouchableRipple, Button } from "react-native-paper";
import type { Appliance } from "@safe-eats/types/applianceTypes";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../_app";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import RecipeCard from "./RecipeCard";

interface ApplianceCardProps {
  appliance: Appliance;
  navigation: NativeStackScreenProps<
    RootStackParamList,
    "Appliances"
  >["navigation"];
  onDelete: () => void;
}

function ApplianceCard({
  appliance,
  navigation,
  onDelete,
}: ApplianceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const applianceInfoMap = [
    {
      icon: "toaster-oven",
      text: `Appliance Type: ${appliance.type.split("_").join(" ")}`,
    },
  ];

  return (
    <Surface className="mb-4 bg-white">
      <TouchableRipple
        onPress={() => {
          setExpanded((prev) => !prev);
        }}
      >
        <View className="p-4">
          <View className="flex-row justify-between pb-2">
            <View></View>
            <Text variant="titleLarge">
              <MaterialCommunityIcons name={"toaster-oven"} size={24} />
              {` ${appliance.name}`}
            </Text>
            <MaterialCommunityIcons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={24}
            />
          </View>
          {expanded && (
            <View className="gap-3">
              {applianceInfoMap.map((applianceInfo) => {
                return (
                  <Text key={applianceInfo.text}>
                    <MaterialCommunityIcons
                      name={applianceInfo.icon as any}
                      size={20}
                    />
                    {` ${applianceInfo.text}`}
                  </Text>
                );
              })}
              <View className="flex w-full flex-row justify-around">
                <Button
                  icon="square-edit-outline"
                  mode="outlined"
                  onPress={() =>
                    navigation.push("ModifyAppliance", {
                      appliance: appliance,
                      modifyType: "update",
                    })
                  }
                >
                  Edit
                </Button>
                <Button
                  icon="trash-can-outline"
                  mode="contained-tonal"
                  onPress={onDelete}
                >
                  Delete
                </Button>
              </View>
            </View>
          )}
        </View>
      </TouchableRipple>
    </Surface>
  );
}

export default ApplianceCard;
