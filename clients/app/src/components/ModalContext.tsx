import React, {
  createContext,
  useState,
  useContext,
  SetStateAction,
  Dispatch,
} from "react";
import { Modal, Portal } from "react-native-paper";

interface ModalContextInterface {
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  setModalContent: (modalContent: React.ReactNode) => void;
}

const ModalContext = createContext<ModalContextInterface>({
  setModalVisible: () => {},
  setModalContent: () => {},
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }: { children: JSX.Element }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  return (
    <ModalContext.Provider
      value={{
        setModalVisible,
        setModalContent,
      }}
    >
      <Portal.Host>{children}</Portal.Host>
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
          {modalContent}
        </Modal>
      </Portal>
    </ModalContext.Provider>
  );
};
