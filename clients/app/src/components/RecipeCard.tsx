import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Recipe } from "@safe-eats/types/recipeTypes";
import { View, Text, Pressable } from "react-native";
import { RootStackParamList } from "../_app";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import DeleteRecipeButton from "./DeleteRecipeButton";
import RecipeInfo from "./RecipeInfo";
import { IconButton } from "../components/Buttons";

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
      <Pressable
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
                <IconButton
                  color="black"
                  classes="shadow-stone-40 rounded-2xl p-3 bg-orange-200"
                  icon="square-edit-outline"
                  onPress={() =>
                    navigation.push("ModifyRecipe", {
                      recipe: recipe,
                      modifyType: "update",
                    })
                  }
                >
                  Edit
                </IconButton>
                <DeleteRecipeButton
                  recipe={recipe}
                  iconSize={24}
                  showText={true}
                />
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

export default RecipeCard;
