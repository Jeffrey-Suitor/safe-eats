import { SafeAreaView, View, FlatList, ActivityIndicator } from "react-native";
import { useCallback, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../_app";
import { trpc } from "../utils/trpc";
import SpeedDial from "../components/SpeedDial";
import RecipeCard from "../components/RecipeCard";

export type NavigationProps = NativeStackScreenProps<
  RootStackParamList,
  "Recipes"
>;

function RecipesPage({ navigation }: NavigationProps) {
  const [refreshing, setRefreshing] = useState(false);
  const utils = trpc.useContext();
  const { data: recipes, isLoading } = trpc.recipe.all.useQuery();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    utils.recipe.all.invalidate();
    setRefreshing(false);
  }, []);

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
          contentContainerStyle={{ justifyContent: "space-between" }}
          className="mb-4"
          onRefresh={() => onRefresh()}
          refreshing={refreshing}
          data={recipes}
          renderItem={({ item: recipe }) => (
            <RecipeCard recipe={recipe} navigation={navigation} />
          )}
        />
        <SpeedDial navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

export default RecipesPage;
