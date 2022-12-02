import { HelperText } from "react-native-paper";
import { SafeAreaView, View, Text } from "react-native";
import React, { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../_app";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
    <SafeAreaView>
      <View className="h-full w-full p-4">
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

        <View className="flex flex-row">
          <TextInput
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
          />
          <DropDown
            label="CookingTimeUnit"
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
        </View>

        <View className="flex flex-row">
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
        </View>

        <View className="flex flex-row">
          <TextInput
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
          />

          {/* <StyledDropDown
              className="w-1/4"
              mode={"flat"}
              visible={showDropDown === "expiryDate"}
              showDropDown={() => setShowDropDown("expiryDate")}
              onDismiss={() => setShowDropDown(null)}
              value={expiryDateUnit}
              setValue={setExpiryDateUnit}
              list={expiryDateUnits.map(unit => { return { label: unit, value: unit } })}
            /> */}
        </View>

        {/* <View>
          <StyledDropDown
            // @ts-ignore
            label=<Text><MaterialCommunityIcons name={"toaster-oven"} size={20} /> Appliance</Text>
            mode={"flat"}
            visible={showDropDown === "appliance"}
            showDropDown={() => setShowDropDown("appliance")}
            onDismiss={() => setShowDropDown(null)}
            value={newRecipe.applianceType}
            setValue={(value) => setNewRecipe(prev => { return { ...prev, applianceType: value } })}
            list={applianceTypes.map(val => { return { label: val.replace("_", " "), value: val} })}
          />
          <HelperText type="error" visible={false}>
            Please select an appliance
          </HelperText>
        </View> */}

        <View className="flex flex-row">
          <TextInput
            label="Cooking Temperature"
            value={newRecipe.temperature.toString()}
            onChangeText={(temperature) =>
              setNewRecipe((prev) => {
                return { ...prev, temperature: Number(temperature) };
              })
            }
            errorText="Please enter a cooking temperature"
            showError={showErrors && newRecipe.temperature === 0}
          />
          {/* <StyledDropDown
              className="w-1/4"
              mode={"flat"}
              visible={showDropDown === "temperatureUnit"}
              showDropDown={() => setShowDropDown("temperatureUnit")}
              onDismiss={() => setShowDropDown(null)}
              value={newRecipe.temperatureUnit}
              setValue={(value) => setNewRecipe((prev) => { return { ...prev, temperatureUnit: value } })}
              list={temperatureUnits.map(unit => { return { label: `°${unit}`, value: unit } })}
            /> */}
        </View>

        {/* <View>
          <StyledDropDown
            // @ts-ignore
            label=<Text><MaterialCommunityIcons name={"record-circle-outline"} size={20} /> Appliance Mode</Text>
            mode={"flat"}
            visible={showDropDown === "applianceMode"}
            showDropDown={() => setShowDropDown("applianceMode")}
            onDismiss={() => setShowDropDown(null)}
            value={newRecipe.applianceMode}
            setValue={(value) => setNewRecipe(prev => { return { ...prev, applianceMode: value } })}
            list={applianceModes.map(unit => { return { label: unit, value: unit } })}
          />
          <HelperText type="error" visible={false}>
            Please select a cooking mode
          </HelperText>
        </View> */}

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
    </SafeAreaView>
  );
}

export default ModifyRecipePage;
