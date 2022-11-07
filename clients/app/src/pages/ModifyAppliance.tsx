import { Text } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../_app";

type Props = NativeStackScreenProps<RootStackParamList, "ModifyAppliance">;

function ModifyAppliancePage({ navigation, route }: Props) {
  const { appliance, modifyType } = route.params;
  return <Text>Modify Appliance Page</Text>;
}

export default ModifyAppliancePage;
