import { FlatList, SafeAreaView, View } from "react-native";
import React from "react";
import { RootStackParamList } from "../_app";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import HomeSpeedDial from "../components/HomeSpeedDial";
import { trpc } from "../utils/trpc";
import { Button, Card, IconButton, List, Text } from "react-native-paper";
import CircularProgress from "react-native-circular-progress-indicator";

type Props = NativeStackScreenProps<RootStackParamList, "Appliances">;

export const Appliances = ({ navigation }: Props) => {
  const utils = trpc.useContext();
  const { data: appliances, isLoading } = trpc.appliance.all.useQuery();
  utils.recipe.all.prefetch();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    utils.appliance.all.invalidate();
    setRefreshing(false);
  }, []);
  return (
    <SafeAreaView>
      <View className="h-full w-full p-4">
        <FlatList
          onRefresh={() => onRefresh()}
          refreshing={refreshing}
          data={appliances}
          renderItem={({ item: appliance }) => {
            return (
              <Card>
                <List.Accordion
                  title={
                    <View>
                      <Text variant="titleLarge">{appliance.name}</Text>
                      <Text variant="titleLarge">{appliance.name}</Text>
                    </View>
                  }
                  left={(props) => <List.Icon {...props} icon="toaster-oven" />}
                >
                  <List.Item
                    title=""
                    left={() => (
                      <View className="flex w-full flex-row justify-around">
                        <Button icon="square-edit-outline" mode="outlined">
                          Edit
                        </Button>
                        <Button icon="trash-can-outline" mode="contained-tonal">
                          Delete
                        </Button>
                        <CircularProgress
                          value={0}
                          radius={120}
                          maxValue={10}
                          initialValue={10}
                          progressValueColor={"#fff"}
                          activeStrokeWidth={15}
                          inActiveStrokeWidth={15}
                          duration={10000}
                          onAnimationComplete={() => alert("time out")}
                        />
                      </View>
                    )}
                  />
                </List.Accordion>
              </Card>
            );
          }}
        />
        <HomeSpeedDial navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};
