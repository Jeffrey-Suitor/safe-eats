import { registerRootComponent } from "expo";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TRPCProvider } from "./utils/trpc";
import { Provider as PaperProvider } from "react-native-paper";
import AppliancesPage from "./pages/Appliances";
import RecipesPage from "./pages/Recipes";
import ScanPage from "./pages/Scan";
import AssignQrCodePage from "./pages/AssignQrCode";
import ModifyRecipePage from "./pages/ModifyRecipe";
import ModifyAppliancePage from "./pages/ModifyAppliance";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ToastProvider } from "react-native-paper-toast";
import { Recipe } from "@safe-eats/types/recipeTypes";
import { capitalize } from "./utils/stringHelpers";
import { ModalProvider } from "./components/ModalContext";
import { Appliance } from "@safe-eats/types/applianceTypes";

type ModifyType = "add" | "update";
type ScanType = "qr-code" | "appliance";

export type RootStackParamList = {
  Home: undefined;
  Appliances: undefined;
  ModifyAppliance: { appliance: Appliance; modifyType: ModifyType };
  Scan: { scanType: ScanType };
  Recipes: undefined;
  ModifyRecipe: { recipe: Recipe; modifyType: ModifyType };
  AssignQrCode: { qrCode: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createMaterialBottomTabNavigator<RootStackParamList>();

const HomePage = () => {
  return (
    <Tab.Navigator initialRouteName="Appliances">
      <Tab.Screen
        name="Appliances"
        component={AppliancesPage}
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
        component={RecipesPage}
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
            <ModalProvider>
              <NavigationContainer>
                <Stack.Navigator>
                  <Stack.Screen name="Home" component={HomePage} />
                  <Stack.Screen
                    name="Scan"
                    component={ScanPage}
                    options={({ route }) => ({
                      title: `Scan ${
                        route.params.scanType === "qr-code"
                          ? "QR Code"
                          : "Appliance"
                      }`,
                    })}
                  />
                  <Stack.Screen
                    name="ModifyRecipe"
                    component={ModifyRecipePage}
                    options={({ route }) => ({
                      title: `${capitalize(route.params.modifyType)} Recipe`,
                    })}
                  />
                  <Stack.Screen
                    name="ModifyAppliance"
                    component={ModifyAppliancePage}
                    options={({ route }) => ({
                      title: `${capitalize(route.params.modifyType)} Appliance`,
                    })}
                  />
                  <Stack.Screen
                    name="AssignQrCode"
                    component={AssignQrCodePage}
                    options={() => ({
                      title: "Assign QR Code",
                    })}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </ModalProvider>
          </ToastProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </TRPCProvider>
  );
};

registerRootComponent(App);
