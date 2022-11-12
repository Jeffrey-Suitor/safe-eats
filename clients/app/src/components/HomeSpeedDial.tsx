import { FAB, Portal, Provider } from "react-native-paper";
import { RootStackParamList } from "../_app";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { defaultRecipe } from "@safe-eats/types/recipeTypes";

export type NavigationProps =
  | NativeStackScreenProps<RootStackParamList, "Appliances">
  | NativeStackScreenProps<RootStackParamList, "Recipes">;

interface SpeedDialProps {
  navigation: NavigationProps["navigation"];
}

function HomeSpeedDial({ navigation }: SpeedDialProps) {
  const [open, setOpen] = useState(false);
  return (
    <Provider>
      <Portal>
        <FAB.Group
          visible={true}
          open={open}
          icon={open ? "close" : "plus"}
          actions={[
            {
              icon: "qrcode-scan",
              label: "Scan QR Code",
              onPress: () => navigation.push("Scan", { scanType: "qr-code" }),
            },
            {
              icon: "chef-hat",
              label: "Add Recipe",
              onPress: () =>
                navigation.push("ModifyRecipe", {
                  recipe: defaultRecipe,
                  modifyType: "add",
                }),
            },
            {
              icon: "toaster-oven",
              label: "Add Appliance",
              onPress: () => navigation.push("Scan", { scanType: "appliance" }),
            },
          ]}
          onStateChange={({ open }) => setOpen(open)}
        />
      </Portal>
    </Provider>
  );
}

export default HomeSpeedDial;
