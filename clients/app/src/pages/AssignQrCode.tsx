import { FlatList, SafeAreaView, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { RootStackParamList } from "../_app";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HomeSpeedDial from "../components/HomeSpeedDial";
import { trpc } from "../utils/trpc";
import { Button, Text, ActivityIndicator } from "react-native-paper";
import ApplianceCard from "../components/ApplianceCard";
import { Appliance } from "@safe-eats/types/applianceTypes";
import { useModal } from "../components/ModalContext";
import { useToast } from "react-native-paper-toast";

type Props = NativeStackScreenProps<RootStackParamList, "Appliances">;

function AssignQrCodePage({ navigation }: Props) {
  const utils = trpc.useContext();
  const toaster = useToast();
  const { data: appliances, isLoading } = trpc.appliance.all.useQuery();
  utils.recipe.all.prefetch();

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
    setModalContent(
      <View className="flex flex-grow items-center justify-center gap-4 bg-white p-4 pt-2">
        <Text className="text-center" variant="titleMedium">
          Are you sure you want to delete this appliance?
        </Text>
        <Button
          mode="contained"
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
        <Button mode="contained-tonal" onPress={() => setModalVisible(false)}>
          Cancel
        </Button>
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
              appliance={appliance}
              navigation={navigation}
              onDelete={() => {
                setCurrentAppliance(appliance);
                setModalVisible(true);
              }}
            />
          )}
        />
        <HomeSpeedDial navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

export default AssignQrCodePage;
