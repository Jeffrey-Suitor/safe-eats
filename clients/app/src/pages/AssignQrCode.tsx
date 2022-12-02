import {
  FlatList,
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { useCallback, useState } from "react";
import { RootStackParamList } from "../_app";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { trpc } from "../utils/trpc";
import { Recipe } from "@safe-eats/types/recipeTypes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import RecipeSelectCard from "../components/RecipeSelectCard";
import { useToast } from "react-native-paper-toast";
import { Button } from "../components/Buttons";

export type NavigationProps = NativeStackScreenProps<
  RootStackParamList,
  "AssignQrCode"
>;

function AssignQrCodePage({ navigation, route }: NavigationProps) {
  const qrCode = route.params.qrCode;
  const toaster = useToast();
  const utils = trpc.useContext();
  const [refreshing, setRefreshing] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);

  const { data: recipes, isLoading } = trpc.recipe.all.useQuery();
  const { mutate: addQrCode, isLoading: isLoadingMutation } =
    trpc.qrCode.add.useMutation({
      async onError(error, variables, context) {
        toaster.show({
          type: "error",
          message: `You've already used this QR and assigned it to ${currentRecipe?.name}`,
          duration: 2000,
          messageContainerStyle: {
            flexDirection: "row",
          },
        });
        setCurrentRecipe(null);
      },
      async onSuccess() {
        utils.recipe.all.invalidate();
        toaster.show({
          type: "success",
          message: `Your QR code was assigned to a ${currentRecipe?.name}.`,
          duration: 2000,
          messageContainerStyle: {
            flexDirection: "row",
          },
        });
        setCurrentRecipe(null);
      },
    });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    utils.recipe.all.invalidate();
    setRefreshing(false);
  }, []);

  if (isLoading || isLoadingMutation) {
    return (
      <View className="flex h-full items-center justify-center">
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView>
      <View className="h-full w-full p-4">
        <Text className="text-sm">
          <MaterialCommunityIcons name="qrcode" size={24} />
          {` ${qrCode}`}
        </Text>

        <FlatList
          contentContainerStyle={{ justifyContent: "space-between" }}
          className="h-full"
          onRefresh={() => onRefresh()}
          refreshing={refreshing}
          data={recipes}
          renderItem={({ item: recipe }) => (
            <RecipeSelectCard
              recipe={recipe}
              navigation={navigation}
              isSelected={recipe === currentRecipe}
              onSelect={() => {
                setCurrentRecipe(recipe);
              }}
            />
          )}
        />

        <Button
          disabled={!currentRecipe}
          onPress={() => {
            if (currentRecipe === null) {
              console.error("currentRecipe is null");
              return;
            }
            if (currentRecipe.id === undefined) {
              console.error("currentRecipe.id is null");
              return;
            }
            addQrCode({ id: qrCode, recipeId: currentRecipe.id });
          }}
        >
          Assign Recipe
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default AssignQrCodePage;
