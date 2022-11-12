import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Recipe } from "@safe-eats/types/recipeTypes";
import { View, Text } from "react-native";
import { Button, TouchableRipple } from "react-native-paper";
import { RootStackParamList } from "../_app";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import DeleteRecipeButton from "./DeleteRecipeButton";
import RecipeInfo from "./RecipeInfo";

interface RecipeCardProps {
  recipe: Recipe;
  navigation: NativeStackScreenProps<
    RootStackParamList,
    "Recipes"
  >["navigation"];
}

function RecipeCard({ recipe, navigation }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View key={recipe.id} className="mb-4 rounded-xl bg-white shadow-lg">
      <TouchableRipple
        onPress={() => {
          setExpanded((prev) => !prev);
        }}
      >
        <View className="flex justify-between p-4">
          <View
            className={`flex-row justify-between ${expanded ? "pb-4" : ""}`}
          >
            <Text className="text-xl">
              <MaterialCommunityIcons name={"chef-hat"} size={24} />
              {` ${recipe.name}`}
            </Text>
            <MaterialCommunityIcons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={24}
            />
          </View>
          {expanded && (
            <View className="gap-y-4 pt-4">
              <RecipeInfo recipe={recipe} containerClassName="flex gap-4" />
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
                <DeleteRecipeButton
                  recipe={recipe}
                  iconSize={24}
                  iconMode="contained-tonal"
                  showText={true}
                />
              </View>
            </View>
          )}
        </View>
      </TouchableRipple>
    </View>
  );
}

export default RecipeCard;
