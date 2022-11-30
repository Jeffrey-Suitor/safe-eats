import "expo-dev-client";
import { registerRootComponent } from "expo";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TRPCProvider } from "./utils/trpc";
import {
  adaptNavigationTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import AppliancesPage from "./pages/Appliances";
import RecipesPage from "./pages/Recipes";
import ScanPage from "./pages/Scan";
import AssignQrCodePage from "./pages/AssignQrCode";
import ModifyRecipePage from "./pages/ModifyRecipe";
import ModifyAppliancePage from "./pages/ModifyAppliance";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ToastProvider } from "react-native-paper-toast";
import { Recipe } from "@safe-eats/types/recipeTypes";
import { capitalize } from "@safe-eats/helpers/stringHelpers";
import { ModalProvider } from "./components/ModalContext";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import * as Sentry from "sentry-expo";
import PushNotificationWrapper from "./components/PushNotificationsWrapper";
import * as WebBrowser from "expo-web-browser";
import LoginPage from "./pages/Login";
import { AuthProvider, useAuth } from "./components/AuthContext";

type ModifyType = "add" | "update";
type ScanType = "qr-code" | "appliance";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Appliances: undefined;
  ModifyAppliance: { applianceId: string; modifyType: ModifyType };
  Scan: { scanType: ScanType };
  Recipes: undefined;
  ModifyRecipe: { recipe: Recipe; modifyType: ModifyType };
  AssignQrCode: { qrCode: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createMaterialBottomTabNavigator<RootStackParamList>();

function HomePage() {
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
}

function Navigator() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginPage} />
      </Stack.Navigator>
    );
  }
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen
        name="Scan"
        component={ScanPage}
        options={({ route }) => ({
          title: `Scan ${
            route.params.scanType === "qr-code" ? "QR Code" : "Appliance"
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
  );
}

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  light: NavigationDefaultTheme,
  dark: NavigationDarkTheme,
});

const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: "rgb(154, 70, 0)",
    onPrimary: "rgb(255, 255, 255)",
    primaryContainer: "rgb(255, 219, 201)",
    onPrimaryContainer: "rgb(50, 18, 0)",
    secondary: "rgb(118, 88, 71)",
    onSecondary: "rgb(255, 255, 255)",
    secondaryContainer: "rgb(255, 219, 201)",
    onSecondaryContainer: "rgb(43, 22, 10)",
    tertiary: "rgb(98, 96, 51)",
    onTertiary: "rgb(255, 255, 255)",
    tertiaryContainer: "rgb(233, 229, 171)",
    onTertiaryContainer: "rgb(30, 29, 0)",
    error: "rgb(186, 26, 26)",
    onError: "rgb(255, 255, 255)",
    errorContainer: "rgb(255, 218, 214)",
    onErrorContainer: "rgb(65, 0, 2)",
    background: "rgb(255, 251, 255)",
    onBackground: "rgb(32, 26, 23)",
    surface: "rgb(255, 251, 255)",
    onSurface: "rgb(32, 26, 23)",
    surfaceVariant: "rgb(244, 222, 212)",
    onSurfaceVariant: "rgb(82, 68, 60)",
    outline: "rgb(133, 116, 107)",
    outlineVariant: "rgb(215, 194, 184)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(54, 47, 44)",
    inverseOnSurface: "rgb(251, 238, 233)",
    inversePrimary: "rgb(255, 182, 140)",
    elevation: {
      level0: "transparent",
      level1: "rgb(250, 242, 242)",
      level2: "rgb(247, 237, 235)",
      level3: "rgb(244, 231, 227)",
      level4: "rgb(243, 229, 224)",
      level5: "rgb(241, 226, 219)",
    },
    surfaceDisabled: "rgba(32, 26, 23, 0.12)",
    onSurfaceDisabled: "rgba(32, 26, 23, 0.38)",
    backdrop: "rgba(59, 46, 39, 0.4)",
  },
};

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enableInExpoDevelopment: true,
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

const App = () => {
  React.useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  return (
    <TRPCProvider>
      <SafeAreaProvider>
        <PaperProvider theme={CombinedDefaultTheme}>
          <ToastProvider>
            <ModalProvider>
              <NavigationContainer theme={CombinedDefaultTheme}>
                <AuthProvider>
                  <PushNotificationWrapper>
                    <Navigator />
                  </PushNotificationWrapper>
                </AuthProvider>
              </NavigationContainer>
            </ModalProvider>
          </ToastProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </TRPCProvider>
  );
};

registerRootComponent(App);
