import { View } from "react-native";
import {
  Surface,
  Text,
  TouchableRipple,
  Button,
  IconButton,
} from "react-native-paper";
import type { Appliance } from "@safe-eats/types/applianceTypes";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../_app";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import RecipeInfo from "./RecipeInfo";
import CircularProgress from "react-native-circular-progress-indicator";

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
  const { recipe } = appliance;
  const [applianceExpanded, setApplianceExpanded] = useState(false);
  const [recipeExpanded, setRecipeExpanded] = useState(false);
  const active = appliance.cookingStartTime !== null;
  const applianceTemperatureUnit = recipe?.temperatureUnit === "C" ? "C" : "F";
  const applianceTemperature =
    recipe?.temperatureUnit === "C"
      ? appliance.temperatureC
      : appliance.temperatureF;
  const recipeTemperature =
    recipe?.temperatureUnit === "C"
      ? recipe?.temperature || 150
      : recipe?.temperature || 300;

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
          setApplianceExpanded((prev) => !prev);
        }}
      >
        <View className="p-4">
          <View className="flex-row justify-between pb-2">
            <View></View>
            <Text variant="titleLarge" className="text-primary">
              <MaterialCommunityIcons name={"toaster-oven"} size={24} />
              {` ${appliance.name}`}
            </Text>
            <MaterialCommunityIcons
              name={applianceExpanded ? "chevron-up" : "chevron-down"}
              size={24}
            />
          </View>

          <View className="flex flex-row justify-evenly">
            <CircularProgress
              value={applianceTemperature}
              progressValueColor={"#fff"}
              maxValue={recipeTemperature + 30}
              title={`${applianceTemperature} ${applianceTemperatureUnit}`}
              rotation={-270}
              strokeColorConfig={[
                { color: "gray", value: 0 },
                { color: "blue", value: applianceTemperature - 30 },
                { color: "green", value: applianceTemperature - 5 },
                { color: "red", value: applianceTemperature + 5 },
              ]}
            />
          </View>

          {applianceExpanded && (
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

              {recipe && (
                <View>
                  <View className="flex flex-row items-center pr-4">
                    <Text className="leading-5">
                      <MaterialCommunityIcons name={"chef-hat"} size={20} />
                      {` Recipe Name: ${recipe.name}`}
                    </Text>
                    <IconButton
                      icon="information-outline"
                      size={20}
                      onPress={() => setRecipeExpanded((prev) => !prev)}
                    />
                  </View>
                  {recipeExpanded && (
                    <RecipeInfo
                      recipe={recipe}
                      containerClassName="gap-4 pl-4 flex"
                    />
                  )}
                </View>
              )}

              <View className="flex w-full flex-row justify-around">
                <Button
                  icon="square-edit-outline"
                  mode="outlined"
                  onPress={() =>
                    navigation.push("ModifyAppliance", {
                      applianceId: appliance.id,
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
