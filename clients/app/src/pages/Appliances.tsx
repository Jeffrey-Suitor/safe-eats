import {
  FlatList,
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { RootStackParamList } from "../_app";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import SpeedDial from "../components/SpeedDial";
import { trpc } from "../utils/trpc";
import ApplianceCard from "../components/ApplianceCard";
import { Appliance } from "@safe-eats/types/applianceTypes";
import { useModal } from "../components/ModalContext";
import { useToast } from "react-native-paper-toast";
import { Button } from "../components/Buttons";

export type NavigationProps = NativeStackScreenProps<
  RootStackParamList,
  "Appliances"
>;

function AppliancesPage({ navigation }: NavigationProps) {
  const utils = trpc.useContext();
  const toaster = useToast();
  const { data: appliances, isLoading } = trpc.appliance.all.useQuery();

  const { mutate: deleteAppliance } = trpc.appliance.delete.useMutation({
    async onSuccess() {
      utils.appliance.all.invalidate();
      toaster.show({
        type: "success",
        message: "Your appliance has been deleted.",
        duration: 2000,
        messageContainerStyle: {
          flexDirection: "row",
        },
      });
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const [currentAppliance, setCurrentAppliance] = useState<Appliance | null>(
    null
  );
  const { setModalVisible, setModalContent } = useModal();

  useEffect(() => {
    utils.recipe.all.prefetch();
  }, []);

  useEffect(() => {
    setModalContent(
      <View className="flex flex-grow items-center justify-center gap-4 bg-white p-4 pt-2">
        <Text className="text-center text-lg">
          Are you sure you want to delete this appliance?
        </Text>
        <Button
          onPress={() => {
            if (currentAppliance === null) {
              console.error("currentAppliance is null");
              return;
            }
            if (currentAppliance.id === undefined) {
              console.error("currentAppliance.id is null");
              return;
            }
            deleteAppliance(currentAppliance.id);
            setModalVisible(false);
          }}
        >
          Delete
        </Button>
        <Button onPress={() => setModalVisible(false)}>Cancel</Button>
      </View>
    );
  }, [currentAppliance]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    utils.appliance.all.invalidate();
    setRefreshing(false);
  }, []);

  if (isLoading) {
    return (
      <View className="flex h-full items-center justify-center">
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView>
      <View className="h-full w-full p-4">
        <FlatList
          contentContainerStyle={{ justifyContent: "space-between" }}
          className="h-full"
          onRefresh={() => onRefresh()}
          refreshing={refreshing}
          data={appliances}
          renderItem={({ item: appliance }) => (
            <ApplianceCard
              applianceId={appliance.id}
              navigation={navigation}
              onDelete={() => {
                setCurrentAppliance(appliance);
                setModalVisible(true);
              }}
            />
          )}
        />
        <SpeedDial navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

export default AppliancesPage;
