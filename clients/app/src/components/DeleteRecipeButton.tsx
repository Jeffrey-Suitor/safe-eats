import { Recipe } from "@safe-eats/types/recipeTypes";
import { useToast } from "react-native-paper-toast";
import { trpc } from "../utils/trpc";
import { useModal } from "./ModalContext";
import { View, TouchableOpacity, Text } from "react-native";
import { useCallback } from "react";
import { Button, IconButton } from "./Buttons";

interface DeleteRecipeButtonProps {
  recipe: Recipe;
  iconSize: number;
  showText: boolean;
}

function DeleteRecipeButton({
  recipe,
  iconSize,
  showText,
}: DeleteRecipeButtonProps) {
  const toaster = useToast();
  const utils = trpc.useContext();
  const { setModalVisible, setModalContent } = useModal();

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

  const onPress = useCallback(() => {
    setModalContent(
      <View className="flex h-max items-center justify-between gap-y-5 bg-white p-4">
        <Text className="text-md  font-semibold">
          Are you sure you want to delete this recipe?
        </Text>
        <View className="flex flex-row gap-x-10">
          <Button
            className="text-md  rounded-xl bg-orange-400 p-4 font-semibold"
            onPress={() => setModalVisible(false)}
          >
            Cancel
          </Button>
          <Button
            className="text-md  rounded-xl bg-red-400 p-4 font-semibold text-white"
            onPress={() => {
              if (recipe === null) {
                console.error("currentRecipe is null");
                return;
              }
              if (recipe.id === undefined) {
                console.error("currentRecipe.id is null");
                return;
              }
              deleteRecipe(recipe.id);
              setModalVisible(false);
            }}
          >
            Delete
          </Button>
        </View>
      </View>
    );
    setModalVisible(true);
  }, [recipe]);

  if (showText) {
    return (
      <IconButton
        classes="shadow-stone-40 rounded-2xl p-3 bg-red-400"
        onPress={onPress}
        icon="trash-can-outline"
        textClasses="text-white"
      >
        Delete
      </IconButton>
    );
  } else {
    return (
      <IconButton
        classes="shadow-stone-40 rounded-2xl p-3 bg-red-400"
        icon="trash-can-outline"
        size={iconSize}
        onPress={onPress}
      />
    );
  }
}

export default DeleteRecipeButton;
