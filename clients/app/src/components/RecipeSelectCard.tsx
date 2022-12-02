import { Text, Surface, TouchableRipple, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { Recipe } from "@safe-eats/types/recipeTypes";
import DeleteRecipeButton from "./DeleteRecipeButton";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../_app";
import { useState } from "react";
import {
  millisecondsToUnits,
  unitToLong,
} from "@safe-eats/helpers/timeConverter";
import RecipeInfo from "./RecipeInfo";

interface RecipeSelectCardProps {
  recipe: Recipe;
  isSelected: boolean;
  onSelect: () => void;
  navigation: NativeStackScreenProps<
    RootStackParamList,
    "AssignQrCode"
  >["navigation"];
}

function RecipeSelectCard({
  recipe,
  isSelected,
  onSelect,
  navigation,
}: RecipeSelectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { val: ctVal, unit: ctUnit } = millisecondsToUnits(
    recipe.cookingTime,
    "cookingTime"
  );
  const { val: edVal, unit: edUnit } = millisecondsToUnits(
    recipe.expiryDate,
    "expiryDate"
  );

  interface TextIconInterface {
    icon: string;
    text: string;
  }

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
      text: `Temperature: ${recipe.temperature} ${recipe.temperatureUnit}`,
    },
    {
      icon: "record-circle-outline",
      text: `Appliance Mode: ${recipe.applianceMode}`,
    },
  ];

  return (
    <Surface>
      <TouchableRipple onPress={onSelect}>
        <View className="p-4">
          <View className="flex flex-row items-center justify-between">
            <View className="grow flex-row gap-4">
              <MaterialCommunityIcons
                name={
                  isSelected
                    ? "checkbox-marked-circle"
                    : "checkbox-blank-circle-outline"
                }
                size={24}
              />
              <Text variant="titleLarge">
                <MaterialCommunityIcons name={"chef-hat"} size={24} />
                {` ${recipe.name}`}
              </Text>
            </View>

            <View className="flex-row">
              <IconButton
                icon="information-outline"
                mode="outlined"
                size={20}
                onPress={() => setExpanded((prev) => !prev)}
              />
              <IconButton
                icon="square-edit-outline"
                mode="outlined"
                size={20}
                onPress={() =>
                  navigation.push("ModifyRecipe", {
                    recipe: recipe,
                    modifyType: "update",
                  })
                }
              />
              <DeleteRecipeButton
                iconSize={20}
                showText={false}
                recipe={recipe}
              />
            </View>
          </View>
          {expanded && <RecipeInfo recipe={recipe} />}
        </View>
      </TouchableRipple>
    </Surface>
  );
}

export default RecipeSelectCard;
