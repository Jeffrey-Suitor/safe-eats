import { View } from "react-native";
import {
  Surface,
  Text,
  TouchableRipple,
  Button,
  IconButton,
} from "react-native-paper";
import type { Appliance } from "@safe-eats/types/applianceTypes";
import { useEffect, useMemo, useState } from "react";
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
interface ApplianceTemperatureDialProps {
  appliance: Appliance;
}

function ApplianceTemperatureDial({
  appliance,
}: ApplianceTemperatureDialProps) {
  const { recipe } = appliance;
  const applianceTemperatureUnit = recipe?.temperatureUnit === "C" ? "C" : "F";
  const applianceTemperature =
    recipe?.temperatureUnit === "C"
      ? appliance.temperatureC
      : appliance.temperatureF;
  const recipeTemperature =
    recipe?.temperatureUnit === "C" ? recipe?.temperature : recipe?.temperature;

  const strokeColorConfig =
    recipeTemperature === undefined
      ? [
          { color: "gray", value: 0 },
          { color: "gray", value: 1 },
        ]
      : [
          { color: "gray", value: 0 },
          { color: "gray", value: recipeTemperature - 50 },
          { color: "blue", value: recipeTemperature - 30 },
          { color: "green", value: recipeTemperature - 5 },
          { color: "red", value: recipeTemperature + 5 },
        ];

  const valueColor = (temp: number, target?: number) => {
    if (!target) {
      return "gray";
    } else if (temp > target + 5) {
      return "red";
    } else if (temp > target - 5) {
      return "green";
    } else if (temp > target - 30) {
      return "blue";
    } else {
      return "gray";
    }
  };

  return (
    <CircularProgress
      value={applianceTemperature}
      maxValue={
        recipeTemperature ? recipeTemperature + 30 : applianceTemperature
      }
      title={
        recipe == null
          ? undefined
          : `/${recipeTemperature}°${applianceTemperatureUnit}`
      }
      strokeColorConfig={strokeColorConfig}
      titleColor="#000000"
      progressValueColor={valueColor(applianceTemperature, recipeTemperature)}
    />
  );
}

function ApplianceCookingTimeDial({
  appliance,
}: ApplianceTemperatureDialProps) {
  const { recipe, cookingStartTime } = appliance;

  if (recipe === null) {
    return null;
  }

  const recipeEndTime = cookingStartTime.getTime() + recipe.cookingTime;
  const [timeRemaining, setTimeRemaining] = useState(
    recipeEndTime - Date.now()
  );

  useEffect(() => {
    setInterval(() => {
      setTimeRemaining(recipeEndTime - Date.now());
    }, 1000);
  }, []);

  const RemainingTimeDial = useMemo(
    () => (
      <CircularProgress
        value={timeRemaining + 8768712369808}
        maxValue={recipeEndTime}
        initialValue={recipeEndTime}
        inActiveStrokeColor={"#2ecc71"}
        inActiveStrokeOpacity={0.2}
        showProgressValue={false}
        title={new Date(timeRemaining)
          .toTimeString()
          .replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")}
        subtitle={"Remaining"}
      />
    ),
    [timeRemaining]
  );
  return RemainingTimeDial;
}

function ApplianceCard({
  appliance,
  navigation,
  onDelete,
}: ApplianceCardProps) {
  const { recipe, temperatureC, temperatureF, type } = appliance;
  const [applianceExpanded, setApplianceExpanded] = useState(false);
  const [recipeExpanded, setRecipeExpanded] = useState(false);

  const applianceInfoMap = [
    {
      icon: "toaster-oven",
      text: `Appliance Type: ${type.split("_").join(" ")}`,
    },
    {
      icon: "thermometer",
      text: `Temperature: ${temperatureF}°F | ${temperatureC}°C`,
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

          <View className="mb-4 flex flex-row justify-evenly">
            <ApplianceTemperatureDial appliance={appliance} />
            <ApplianceCookingTimeDial appliance={appliance} />
          </View>

          {applianceExpanded && (
            <View className="gap-4">
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
                <>
                  <View className="flex flex-row items-center pl-4">
                    <Text>
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
                      containerClassName="gap-4 pl-8 flex"
                    />
                  )}
                </>
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
