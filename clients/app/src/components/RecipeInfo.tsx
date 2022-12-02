import { Recipe } from "@safe-eats/types/recipeTypes";
import {
  millisecondsToUnits,
  unitToLong,
} from "@safe-eats/helpers/timeConverter";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Text } from "react-native";

interface RecipeInfoProps {
  recipe: Recipe;
  containerClassName?: string;
  stringClassName?: string;
}

interface TextIconInterface {
  icon: string;
  text: string;
}

function RecipeInfo({
  recipe,
  containerClassName,
  stringClassName,
}: RecipeInfoProps) {
  const { val: ctVal, unit: ctUnit } = millisecondsToUnits(
    recipe.cookingTime,
    "cookingTime"
  );
  const { val: edVal, unit: edUnit } = millisecondsToUnits(
    recipe.expiryDate,
    "expiryDate"
  );
  const recipeInfoMap: TextIconInterface[] = [
    {
      icon: "file-document-outline",
      text: `Description: ${recipe.description}`,
    },
    {
      icon: "clock-outline",
      text: `Cooking Time: ${ctVal} ${unitToLong(ctVal, ctUnit)}`,
    },
    {
      icon: "calendar-month-outline",
      text: `Expiry Date: ${edVal} ${unitToLong(edVal, edUnit)}`,
    },
    {
      icon: "toaster-oven",
      text: `Appliance: ${recipe.applianceType.split("_").join(" ")}`,
    },
    {
      icon: "thermometer",
      text: `Temperature: ${recipe.temperature}°${recipe.temperatureUnit}`,
    },
    {
      icon: "record-circle-outline",
      text: `Appliance Mode: ${recipe.applianceMode}`,
    },
  ];
  return (
    <View className={containerClassName}>
      {recipeInfoMap.map((recipeInfo) => {
        return (
          <Text key={recipeInfo.text} className={stringClassName + "leading-5"}>
            <MaterialCommunityIcons name={recipeInfo.icon as any} size={20} />
            {` ${recipeInfo.text}`}
          </Text>
        );
      })}
    </View>
  );
}

export default RecipeInfo;
