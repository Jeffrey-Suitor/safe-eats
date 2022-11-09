import { Recipe } from "@safe-eats/types/recipeTypes";
import { useToast } from "react-native-paper-toast";
import { trpc } from "../utils/trpc";
import { useModal } from "./ModalContext";
import { View } from "react-native";
import { Button, Text, IconButton } from "react-native-paper";
import { useCallback } from "react";

interface DeleteRecipeButtonProps {
  recipe: Recipe;
  iconSize: number;
  showText: boolean;
  iconMode: string;
}

function DeleteRecipeButton({
  recipe,
  iconSize,
  showText,
  iconMode,
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
      <View className="flex flex-grow items-center justify-center gap-4 bg-white p-4 pt-2">
        <Text className="text-center" variant="titleMedium">
          Are you sure you want to delete this recipe?
        </Text>
        <Button
          mode="contained"
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
        <Button mode="contained-tonal" onPress={() => setModalVisible(false)}>
          Cancel
        </Button>
      </View>
    );
    setModalVisible(true);
  }, [recipe]);

  if (showText) {
    return (
      <Button mode={iconMode as any} onPress={onPress} icon="trash-can-outline">
        Delete
      </Button>
    );
  } else {
    return (
      <IconButton
        icon="trash-can-outline"
        mode={iconMode as any}
        size={iconSize}
        onPress={onPress}
      />
    );
  }
}

export default DeleteRecipeButton;
