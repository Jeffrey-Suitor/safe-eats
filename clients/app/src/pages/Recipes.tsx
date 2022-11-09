import { SafeAreaView, View, FlatList } from "react-native";
import { useCallback, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../_app";
import { trpc } from "../utils/trpc";
import { ActivityIndicator } from "react-native-paper";
import HomeSpeedDial from "../components/HomeSpeedDial";
import RecipeCard from "../components/RecipeCard";

type Props = NativeStackScreenProps<RootStackParamList, "Recipes">;

function RecipesPage({ navigation }: Props) {
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
          className="mb-4"
          onRefresh={() => onRefresh()}
          refreshing={refreshing}
          data={recipes}
          renderItem={({ item: recipe }) => (
            <RecipeCard recipe={recipe} navigation={navigation} />
          )}
        />
        <HomeSpeedDial navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

export default RecipesPage;
