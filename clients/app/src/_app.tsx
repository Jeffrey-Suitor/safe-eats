import { registerRootComponent } from "expo";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TRPCProvider } from "./utils/trpc";
import { Portal, Text, Provider as PaperProvider } from "react-native-paper";
import { Appliances } from "./pages/Appliances";
import { Recipes } from "./pages/Recipes";
import { Scan } from "./pages/Scan";
import { ModifyRecipe } from "./pages/ModifyRecipe";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ToastProvider } from "react-native-paper-toast";
import { Recipe } from "@safe-eats/types/recipeTypes";
import { capitalize } from "./utils/stringHelpers";

export type RootStackParamList = {
  Home: undefined;
  Appliances: undefined;
  Scan: { scanType: string };
  ModifyRecipe: { recipe: Recipe; modifyType: "add" | "update" };
  Recipes: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createMaterialBottomTabNavigator<RootStackParamList>();

const Home = () => {
  return (
    <Tab.Navigator initialRouteName="Appliances">
      <Tab.Screen
        name="Appliances"
        component={Appliances}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialCommunityIcons
              name="toaster-oven"
              color={color}
              size={26}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={Recipes}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialCommunityIcons name="chef-hat" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <TRPCProvider>
      <SafeAreaProvider>
        <PaperProvider>
          <ToastProvider>
            <NavigationContainer>
              <Stack.Navigator>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Scan" component={Scan} />
                <Stack.Screen
                  name="ModifyRecipe"
                  component={ModifyRecipe}
                  initialParams={{ recipe: undefined }}
                  options={({ route }) => ({
                    title: `${capitalize(route.params.modifyType)} Recipe`,
                  })}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </ToastProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </TRPCProvider>
  );
};

registerRootComponent(App);
