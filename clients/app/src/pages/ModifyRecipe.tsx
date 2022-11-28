import { Text, HelperText, TextInput, Button } from "react-native-paper";
import { SafeAreaView, View } from "react-native";
import React, { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../_app";
import { useState } from "react";
import {
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { trpc } from "../utils/trpc";
import DropDown from "react-native-paper-dropdown";
import { styled } from 'nativewind';
import type {Recipe} from "@safe-eats/types/recipeTypes";
import { temperatureUnits, RecipeSchema } from "@safe-eats/types/recipeTypes";
import { applianceTypes, applianceModes } from "@safe-eats/types/applianceConstants";
import { cookingTimeUnits, expiryDateUnits, millisecondsToUnits,unitsToMilliseconds } from "@safe-eats/helpers/timeConverter";
import { capitalize } from "@safe-eats/helpers/stringHelpers";

const StyledTextInput = styled(TextInput);
const StyledDropDown = styled(DropDown);

 export type NavigationProps = NativeStackScreenProps<RootStackParamList, "ModifyRecipe">;
const dropDownValues = ["cookingTime", "expiryDate", "appliance", "temperatureUnit", "applianceMode"] as const;

function ModifyRecipePage  ({ navigation, route }: NavigationProps) {
  const { recipe, modifyType } = route.params;
  const { mutate } = trpc.recipe[modifyType].useMutation({
    async onSuccess() {
      navigation.pop();
    },
  });

  const initialCookingTime = millisecondsToUnits(recipe.cookingTime, "cookingTime");
  const initialExpiryDate = millisecondsToUnits(recipe.expiryDate, "expiryDate");

  const [showDropDown, setShowDropDown] = useState<typeof dropDownValues[number] | null>(null);
  const [showErrors, setShowErrors] = useState(false);

    const [cookingTimeUnit, setCookingTimeUnit] =
    useState<typeof cookingTimeUnits[number]>(initialCookingTime.unit as typeof cookingTimeUnits[number]);

  const [expiryDateUnit, setExpiryDateUnit] =
    useState<typeof expiryDateUnits[number]>(initialExpiryDate.unit as typeof expiryDateUnits[number]);

  const [newRecipe, setNewRecipe] = useState<Recipe>(recipe);



  const [formComplete, setFormComplete] = useState(false);

  useEffect(() => {
    const result = RecipeSchema.safeParse(newRecipe);
    setFormComplete(result.success);
  }, [newRecipe]);


  return (
    <SafeAreaView>
      <View className="h-full w-full p-4">
        <View>
          <StyledTextInput
            label=<Text><MaterialCommunityIcons name={"chef-hat"} size={20} /> Recipe</Text>
            placeholder="Ex: Chicken Alfredo"
            value={newRecipe.name}
            onChangeText={(textVal) => setNewRecipe((prev) => { return { ...prev, name: textVal } })}
          />
          <HelperText type="error" visible={showErrors && newRecipe.name === ""}>
            Please enter a recipe name
          </HelperText>
        </View>

        <View>
          <StyledTextInput
            label=<Text><MaterialIcons name={"description"} size={20} /> Description</Text>
            placeholder="Ex: Mom's favourite recipe"
            value={newRecipe.description}
            onChangeText={(textVal) => setNewRecipe((prev) => { return { ...prev, description: textVal } })}
          />
          <HelperText type="error" visible={showErrors && newRecipe.description === ""}>
            Please enter a recipe description
          </HelperText>
        </View>

        <View>
          <View className="flex flex-row">
            <StyledTextInput
              className="flex-grow mr-4"
              keyboardType="number-pad"
              label=<Text><MaterialCommunityIcons name={"clock-time-five-outline"} size={20} /> Cooking Time</Text>
              placeholder="Ex: 10"
              value={newRecipe.cookingTime.toString()}
              onChangeText={(textVal) => setNewRecipe((prev) => { return { ...prev, cookingTime: unitsToMilliseconds(Number(textVal), cookingTimeUnit) } })}
            />
            <StyledDropDown
              className="w-1/4"
              mode={"flat"}
              visible={showDropDown === "cookingTime"}
              showDropDown={() => setShowDropDown("cookingTime")}
              onDismiss={() => setShowDropDown(null)}
              value={cookingTimeUnit}
              setValue={setCookingTimeUnit}
              list={cookingTimeUnits.map(unit => { return { label: unit, value: unit } })}
            />
          </View>
          <HelperText type="error" visible={showErrors && newRecipe.cookingTime === 0}>
            Please enter a cooking time
          </HelperText>
        </View>

        <View>
          <View className="flex flex-row">
            <StyledTextInput
              className="flex-grow mr-4"
              keyboardType="number-pad"
              label=<Text><MaterialCommunityIcons name={"calendar-month-outline"} size={20} /> Expiry Date</Text>
              placeholder="Ex: 4"
              value={newRecipe.expiryDate.toString()}
              onChangeText={(textVal) =>
                setNewRecipe((prev) => {
                  return { ...prev, expiryDate: unitsToMilliseconds(Number(textVal), expiryDateUnit) };
                })
              }
            />
            <StyledDropDown
              className="w-1/4"
              mode={"flat"}
              visible={showDropDown === "expiryDate"}
              showDropDown={() => setShowDropDown("expiryDate")}
              onDismiss={() => setShowDropDown(null)}
              value={expiryDateUnit}
              setValue={setExpiryDateUnit}
              list={expiryDateUnits.map(unit => { return { label: unit, value: unit } })}
            />
          </View>
          <HelperText type="error" visible={showErrors && newRecipe.expiryDate === 0}>
            Please enter an expiry date
          </HelperText>
        </View>

        <View>
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
        </View>

        <View >
          <View className="flex flex-row">
            <StyledTextInput
              className="flex-grow mr-4"
              label=<Text><MaterialCommunityIcons name={"thermometer"} size={20} /> Cooking Temperature</Text>
              keyboardType="number-pad"
              placeholder="Ex: 4"
              value={newRecipe.temperature.toString()}
              onChangeText={(textVal) => setNewRecipe((prev) => { return { ...prev, temperature: Number(textVal) } })}
            />
            <StyledDropDown
              className="w-1/4"
              mode={"flat"}
              visible={showDropDown === "temperatureUnit"}
              showDropDown={() => setShowDropDown("temperatureUnit")}
              onDismiss={() => setShowDropDown(null)}
              value={newRecipe.temperatureUnit}
              setValue={(value) => setNewRecipe((prev) => { return { ...prev, temperatureUnit: value } })}
              list={temperatureUnits.map(unit => { return { label: `°${unit}`, value: unit } })}
            />
          </View>

          <HelperText type="error" visible={showErrors && newRecipe.temperature === 0}>
            Please enter a cooking temperature
          </HelperText>
        </View>

        <View>
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
        </View>

        <Button 
        mode="contained" 
        className={!formComplete ? "bg-gray-500": ''}  onPress={() => {
          if (!formComplete) {
            setShowErrors(true)
            return
          }
          mutate(newRecipe);
        }}>
          {`${capitalize(modifyType)} Recipe`}
        </Button>
      </View>
    </SafeAreaView >
  );
};

export default ModifyRecipePage;