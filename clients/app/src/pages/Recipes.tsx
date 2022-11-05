import { SafeAreaView, View, Modal } from "react-native";
import React, { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../_app";
import { trpc } from "../utils/trpc";
import { secondsToUnits, unitToLong } from "../utils/timeConverter";
import { Card, Button, List, Text, Snackbar, Portal } from "react-native-paper";
import type { Recipe } from "@safe-eats/types/recipeTypes";
import HomeSpeedDial from "../components/HomeSpeedDial";
//@ts-ignore
import { useToast } from "react-native-paper-toast";

type Props = NativeStackScreenProps<RootStackParamList, "Recipes">;

interface ListItemParam {
  icon: string;
  text: string;
}

export const Recipes = ({ navigation }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);
  const toaster = useToast();

  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);

  const utils = trpc.useContext();
  const { data: recipes, isLoading } = trpc.recipe.all.useQuery();
  const { mutate: deleteRecipe } = trpc.recipe.delete.useMutation({
    async onSuccess() {
      utils.recipe.all.invalidate();
      toaster.show({
        type: "success",
        message: "Your recipe has been deleted.",
        duration: 2000,
      });
    },
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView>
      <View className="h-full w-full p-4">
        <Modal visible={modalVisible} onDismiss={hideModal}>
          <View className="flex flex-grow items-center justify-center gap-4">
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
                hideModal();
              }}
            >
              Delete
            </Button>
            <Button mode="contained-tonal" onPress={hideModal}>
              Cancel
            </Button>
          </View>
        </Modal>

        {recipes!.map((recipe) => {
          const { val: ctVal, unit: ctUnit } = secondsToUnits(
            recipe.cookingTime
          );
          const { val: edVal, unit: edUnit } = secondsToUnits(
            recipe.expiryDate
          );

          const listItemParamMap: ListItemParam[] = [
            {
              icon: "file-document-outline",
              text: `Description: ${recipe.description}`,
            },
            {
              icon: "calendar-month-outline",
              text: `Expiry Date: ${edVal} ${unitToLong(edVal, edUnit)}`,
            },
            {
              icon: "toaster-oven",
              text: `Appliance: ${recipe.appliance.split("_").join(" ")}`,
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
            <Card key={JSON.stringify(recipe)}>
              <List.Accordion
                title={<Text variant="titleLarge">{recipe.name}</Text>}
                left={(props) => <List.Icon {...props} icon="chef-hat" />}
              >
                {listItemParamMap.map((listParam) => {
                  return (
                    <List.Item
                      key={listParam.text}
                      title={listParam.text}
                      left={(props) => (
                        <List.Icon {...props} icon={listParam.icon} />
                      )}
                    />
                  );
                })}
                <List.Item
                  title=""
                  left={() => (
                    <View className="flex w-full flex-row justify-around">
                      <Button
                        icon="square-edit-outline"
                        mode="outlined"
                        onPress={() => console.log("Edit")}
                      >
                        Edit
                      </Button>
                      <Button
                        icon="trash-can-outline"
                        mode="contained-tonal"
                        onPress={() => {
                          setCurrentRecipe(recipe);
                          showModal();
                        }}
                      >
                        Delete
                      </Button>
                    </View>
                  )}
                />
              </List.Accordion>
            </Card>
          );
        })}
        <HomeSpeedDial navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};
