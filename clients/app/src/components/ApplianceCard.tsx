import { View, Text, ActivityIndicator, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../_app";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import RecipeInfo from "./RecipeInfo";
import CircularProgress from "react-native-circular-progress-indicator";
import { trpc } from "../utils/trpc";
import { Recipe } from "@safe-eats/types/recipeTypes";
import { Appliance } from "@safe-eats/types/applianceTypes";
import { IconButton } from "../components/Buttons";
interface ApplianceTemperatureDialProps {
  appliance: Appliance;
}

function ApplianceTemperatureDial({
  appliance,
}: ApplianceTemperatureDialProps) {
  const { temperatureC, temperatureF, id, recipe, cookingStartTime } =
    appliance;
  const [temp, setTemp] = useState({ temperatureF, temperatureC });

  const utils = trpc.useContext();
  trpc.appliance.onTemperatureUpdate.useSubscription(id, {
    onData: (temperatures) => {
      utils.appliance.get.setData({ ...appliance, ...temperatures });
      setTemp(temperatures);
    },
    onError(err) {
      console.error("Subscription error:", err);
    },
  });

  const { temperature: recipeTemperature, temperatureUnit } = recipe || {};
  const applianceTemperature =
    temperatureUnit === "C" ? temp.temperatureC : temp.temperatureF;

  const strokeColorConfig =
    recipeTemperature === undefined || cookingStartTime === null
      ? [
          { color: "gray", value: 0 },
          { color: "gray", value: 100 },
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
        cookingStartTime == null
          ? undefined
          : `/${recipeTemperature}°${temperatureUnit}`
      }
      // strokeColorConfig={strokeColorConfig} // TODO: This is currently crashing on android
      titleColor="#000000"
      progressValueColor={valueColor(applianceTemperature, recipeTemperature)}
    />
  );
}

interface ApplianceCookingTimeDialProps {
  recipe: Recipe | null;
  cookingStartTime: Date | null;
}

function ApplianceCookingTimeDial({
  recipe,
  cookingStartTime,
}: ApplianceCookingTimeDialProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (recipe === null || cookingStartTime === null) {
    return null;
  }

  const recipeEndTime = cookingStartTime.getTime() + recipe.cookingTime;
  const timeRemaining = recipeEndTime - currentTime;

  return (
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
  );
}

interface ApplianceCardProps {
  applianceId: string;
  navigation: NativeStackScreenProps<
    RootStackParamList,
    "Appliances"
  >["navigation"];
  onDelete: () => void;
}

function ApplianceCard({
  applianceId,
  navigation,
  onDelete,
}: ApplianceCardProps) {
  const utils = trpc.useContext();

  const { data: appliance, isLoading } =
    trpc.appliance.get.useQuery(applianceId);

  trpc.appliance.onStatusUpdate.useSubscription(applianceId, {
    onData: ({ message, type }) => {
      if (type === "cookingStart" || type === "cookingEnd") {
        utils.appliance.get.invalidate(applianceId);
      }
    },
    onError(err) {
      console.error("Subscription error:", err);
    },
  });

  const [applianceExpanded, setApplianceExpanded] = useState(false);
  const [recipeExpanded, setRecipeExpanded] = useState(false);

  if (isLoading || !appliance) {
    return (
      <View className="flex h-full items-center justify-center">
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  const {
    type,
    temperatureC,
    temperatureF,
    cookingStartTime,
    recipe,
    id,
    name,
  } = appliance;

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
    <View key={id} className="mb-4 rounded-xl bg-white shadow-lg">
      <Pressable
        onPress={() => {
          setApplianceExpanded((prev) => !prev);
        }}
      >
        <View className="p-4">
          <View className="flex-row justify-between pb-2">
            <View></View>
            <Text className="text-lg text-orange-400">
              <MaterialCommunityIcons name={"toaster-oven"} size={24} />
              {` ${name}`}
            </Text>
            <MaterialCommunityIcons
              name={applianceExpanded ? "chevron-up" : "chevron-down"}
              size={24}
            />
          </View>

          <View className="mb-4 flex flex-row justify-evenly">
            <ApplianceTemperatureDial appliance={appliance} />
            <ApplianceCookingTimeDial
              recipe={recipe}
              cookingStartTime={cookingStartTime}
            />
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
                <IconButton
                  color="black"
                  classes="shadow-stone-40 rounded-2xl p-3 bg-orange-400"
                  icon="square-edit-outline"
                  onPress={() =>
                    navigation.push("ModifyAppliance", {
                      applianceId: id,
                      modifyType: "update",
                    })
                  }
                >
                  Edit
                </IconButton>

                <IconButton
                  classes="shadow-stone-40 rounded-2xl p-3 bg-red-400"
                  onPress={onDelete}
                  icon="trash-can-outline"
                >
                  Delete
                </IconButton>
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

export default ApplianceCard;
