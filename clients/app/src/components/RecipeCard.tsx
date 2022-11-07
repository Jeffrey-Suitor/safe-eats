import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Recipe } from "@safe-eats/types/recipeTypes";
import { View } from "react-native";
import { Text, Button, Surface, TouchableRipple } from "react-native-paper";
import { secondsToUnits, unitToLong } from "../utils/timeConverter";
import { RootStackParamList } from "../_app";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";

interface RecipeCardProps {
  recipe: Recipe;
  navigation: NativeStackScreenProps<
    RootStackParamList,
    "Recipes"
  >["navigation"];
  onDelete: () => void;
}
interface TextIconInterface {
  icon: string;
  text: string;
}

function RecipeCard({ recipe, navigation, onDelete }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { val: ctVal, unit: ctUnit } = secondsToUnits(recipe.cookingTime);
  const { val: edVal, unit: edUnit } = secondsToUnits(recipe.expiryDate);

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
    <View>
      <Surface key={recipe.id} className="bg-white">
        <TouchableRipple
          onPress={() => {
            setExpanded((prev) => !prev);
          }}
        >
          <View className="p-4">
            <View className="flex-row justify-between pb-2">
              <View></View>
              <Text variant="titleLarge">
                <MaterialCommunityIcons name={"chef-hat"} size={24} />
                {` ${recipe.name}`}
              </Text>
              <MaterialCommunityIcons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={24}
              />
            </View>
            {expanded && (
              <View className="gap-3">
                {recipeInfoMap.map((recipeInfo) => {
                  return (
                    <Text key={recipeInfo.text}>
                      <MaterialCommunityIcons
                        name={recipeInfo.icon as any}
                        size={20}
                      />
                      {` ${recipeInfo.text}`}
                    </Text>
                  );
                })}
                <View className="flex w-full flex-row justify-around">
                  <Button
                    icon="square-edit-outline"
                    mode="outlined"
                    onPress={() =>
                      navigation.push("ModifyRecipe", {
                        recipe: recipe,
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
    </View>
  );
}

export default RecipeCard;
