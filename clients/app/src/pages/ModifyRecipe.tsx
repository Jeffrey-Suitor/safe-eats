import { View, ScrollView, KeyboardAvoidingView } from "react-native";
import React, { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../_app";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import type { Recipe } from "@safe-eats/types/recipeTypes";
import { temperatureUnits, RecipeSchema } from "@safe-eats/types/recipeTypes";
import {
  applianceTypes,
  applianceModes,
} from "@safe-eats/types/applianceConstants";
import {
  cookingTimeUnits,
  expiryDateUnits,
  millisecondsToUnits,
  unitsToMilliseconds,
} from "@safe-eats/helpers/timeConverter";
import { capitalize } from "@safe-eats/helpers/stringHelpers";
import { Button } from "../components/Buttons";
import {
  TextInput,
  DropDown,
  TextInputWithDropDown,
} from "../components/Inputs";

export type NavigationProps = NativeStackScreenProps<
  RootStackParamList,
  "ModifyRecipe"
>;
const dropDownValues = [
  "cookingTime",
  "expiryDate",
  "appliance",
  "temperatureUnit",
  "applianceMode",
] as const;

function ModifyRecipePage({ navigation, route }: NavigationProps) {
  const { recipe, modifyType } = route.params;
  const { mutate } = trpc.recipe[modifyType].useMutation({
    async onSuccess() {
      navigation.pop();
    },
  });

  const initialCookingTime = millisecondsToUnits(
    recipe.cookingTime,
    "cookingTime"
  );
  const initialExpiryDate = millisecondsToUnits(
    recipe.expiryDate,
    "expiryDate"
  );

  const [showDropDown, setShowDropDown] = useState<
    typeof dropDownValues[number] | null
  >(null);
  const [showErrors, setShowErrors] = useState(false);

  const [cookingTimeUnit, setCookingTimeUnit] = useState<
    typeof cookingTimeUnits[number]
  >(initialCookingTime.unit as typeof cookingTimeUnits[number]);

  const [expiryDateUnit, setExpiryDateUnit] = useState<
    typeof expiryDateUnits[number]
  >(initialExpiryDate.unit as typeof expiryDateUnits[number]);

  const [newRecipe, setNewRecipe] = useState<Recipe>(recipe);

  const [formComplete, setFormComplete] = useState(false);

  useEffect(() => {
    const result = RecipeSchema.safeParse(newRecipe);
    setFormComplete(result.success);
  }, [newRecipe]);

  return (
    <KeyboardAvoidingView className="flex-auto">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex h-full w-screen p-4">
          <View className="grow justify-evenly">
            <TextInput
              label="Recipe"
              value={newRecipe.name}
              onChangeText={(name) =>
                setNewRecipe((prev) => {
                  return { ...prev, name };
                })
              }
              errorText="Please enter a recipe name"
              showError={showErrors && newRecipe.name === ""}
            />

            <TextInput
              label="Description"
              value={newRecipe.description}
              onChangeText={(description) =>
                setNewRecipe((prev) => {
                  return { ...prev, description };
                })
              }
              errorText="Please enter a description"
              showError={showErrors && newRecipe.description === ""}
            />

            <TextInputWithDropDown
              label="Cooking Time"
              value={newRecipe.cookingTime.toString()}
              onChangeText={(cookingTime) =>
                setNewRecipe((prev) => {
                  return {
                    ...prev,
                    cookingTime: unitsToMilliseconds(
                      Number(cookingTime),
                      cookingTimeUnit
                    ),
                  };
                })
              }
              errorText="Please enter a cooking time"
              showError={showErrors && newRecipe.cookingTime === 0}
              selectedOption={cookingTimeUnit}
              options={cookingTimeUnits as unknown as string[]}
              showDropDown={showDropDown === "cookingTime"}
              setShowDropDown={() =>
                setShowDropDown(
                  showDropDown === "cookingTime" ? null : "cookingTime"
                )
              }
              onChange={(cookingTimeUnit) =>
                setCookingTimeUnit(
                  cookingTimeUnit as typeof cookingTimeUnits[number]
                )
              }
            />

            <TextInputWithDropDown
              label="Expiry Date"
              value={newRecipe.expiryDate.toString()}
              onChangeText={(expiryDate) =>
                setNewRecipe((prev) => {
                  return {
                    ...prev,
                    expiryDate: unitsToMilliseconds(
                      Number(expiryDate),
                      expiryDateUnit
                    ),
                  };
                })
              }
              errorText="Please enter an expiry date"
              showError={showErrors && newRecipe.expiryDate === 0}
              selectedOption={expiryDateUnit}
              options={expiryDateUnits as unknown as string[]}
              showDropDown={showDropDown === "expiryDate"}
              setShowDropDown={() =>
                setShowDropDown(
                  showDropDown === "expiryDate" ? null : "expiryDate"
                )
              }
              onChange={(expiryDateUnit) =>
                setExpiryDateUnit(
                  expiryDateUnit as typeof expiryDateUnits[number]
                )
              }
            />

            <DropDown
              label="Appliance"
              selectedOption={newRecipe.applianceType}
              options={applianceTypes as unknown as string[]}
              showDropDown={showDropDown === "appliance"}
              setShowDropDown={() =>
                setShowDropDown(
                  showDropDown === "appliance" ? null : "appliance"
                )
              }
              onChange={(appliance) =>
                setNewRecipe((prev) => {
                  return { ...prev, appliance };
                })
              }
            />

            <TextInputWithDropDown
              label="Temperature"
              value={newRecipe.temperature.toString()}
              onChangeText={(temperature) =>
                setNewRecipe((prev) => {
                  return { ...prev, temperature: Number(temperature) };
                })
              }
              errorText="Please enter a temperature"
              showError={showErrors && newRecipe.temperature === 0}
              selectedOption={newRecipe.temperatureUnit}
              options={temperatureUnits as unknown as string[]}
              showDropDown={showDropDown === "temperatureUnit"}
              setShowDropDown={() =>
                setShowDropDown(
                  showDropDown === "temperatureUnit" ? null : "temperatureUnit"
                )
              }
              onChange={(text) => {
                const temperatureUnit = text as typeof temperatureUnits[number];
                setNewRecipe((prev) => {
                  return { ...prev, temperatureUnit };
                });
              }}
            />

            <DropDown
              label="Appliance Mode"
              selectedOption={newRecipe.applianceMode}
              options={applianceModes as unknown as string[]}
              showDropDown={showDropDown === "applianceMode"}
              setShowDropDown={() =>
                setShowDropDown(
                  showDropDown === "applianceMode" ? null : "applianceMode"
                )
              }
              onChange={(text) => {
                const applianceMode = text as typeof applianceModes[number];
                setNewRecipe((prev) => {
                  return { ...prev, applianceMode };
                });
              }}
            />
          </View>

          <Button
            className={!formComplete ? "bg-gray-500" : ""}
            onPress={() => {
              if (!formComplete) {
                setShowErrors(true);
                return;
              }
              mutate(newRecipe);
            }}
          >
            {`${capitalize(modifyType)} Recipe`}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default ModifyRecipePage;
