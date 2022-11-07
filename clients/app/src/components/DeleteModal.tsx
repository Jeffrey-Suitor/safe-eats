import { View } from "react-native";
import { Modal, Portal, Text, Button, Provider } from "react-native-paper";

interface ModalProps {
  visible: boolean;
  hideModal: () => void;
  onDelete: () => void;
  deleteText: string;
}

const DeleteModal = ({
  visible,
  hideModal,
  onDelete,
  deleteText,
}: ModalProps) => {
  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideModal}>
        <View className="flex flex-grow items-center justify-center gap-4 bg-white p-4 pt-2">
          <Text className="text-center" variant="titleMedium">
            {deleteText}
          </Text>
          <Button mode="contained" onPress={() => onDelete()}>
            Delete
          </Button>
          <Button mode="contained-tonal" onPress={hideModal}>
            Cancel
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default DeleteModal;
