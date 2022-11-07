import { SafeAreaView, View, FlatList } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../_app";
import { trpc } from "../utils/trpc";
import { Button, Text, ActivityIndicator } from "react-native-paper";
import type { Recipe } from "@safe-eats/types/recipeTypes";
import HomeSpeedDial from "../components/HomeSpeedDial";
import { useToast } from "react-native-paper-toast";
import RecipeCard from "../components/RecipeCard";
import { useModal } from "../components/ModalContext";

type Props = NativeStackScreenProps<RootStackParamList, "Recipes">;

function RecipesPage({ navigation }: Props) {
  const { setModalVisible, setModalContent } = useModal();

  const [refreshing, setRefreshing] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);

  const toaster = useToast();

  const utils = trpc.useContext();
  const { data: recipes, isLoading } = trpc.recipe.all.useQuery();
  const { mutate: deleteRecipe } = trpc.recipe.delete.useMutation({
    async onSuccess() {
      utils.recipe.all.invalidate();
      toaster.show({
        type: "success",
        message: "Your recipe has been deleted.",
        duration: 2000,
        messageContainerStyle: {
          flexDirection: "row",
        },
      });
    },
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    utils.recipe.all.invalidate();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    setModalContent(
      <View className="flex flex-grow items-center justify-center gap-4 bg-white p-4 pt-2">
        <Text className="text-center" variant="titleMedium">
          Are you sure you want to delete this recipe?
        </Text>
        <Button
          mode="contained"
          onPress={() => {
            if (currentRecipe === null) {
              console.error("currentRecipe is null");
              return;
            }
            if (currentRecipe.id === undefined) {
              console.error("currentRecipe.id is null");
              return;
            }
            deleteRecipe(currentRecipe.id);
            setModalVisible(false);
          }}
        >
          Delete
        </Button>
        <Button mode="contained-tonal" onPress={() => setModalVisible(false)}>
          Cancel
        </Button>
      </View>
    );
  }, [currentRecipe]);

  if (isLoading) {
    return (
      <View className="flex h-full items-center justify-center">
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView>
      <View className="h-full w-full p-4">
        <FlatList
          className="mb-4"
          onRefresh={() => onRefresh()}
          refreshing={refreshing}
          data={recipes}
          renderItem={({ item: recipe }) => (
            <RecipeCard
              recipe={recipe}
              navigation={navigation}
              onDelete={() => {
                setCurrentRecipe(recipe);
                setModalVisible(true);
              }}
            />
          )}
        />
        <HomeSpeedDial navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

export default RecipesPage;
