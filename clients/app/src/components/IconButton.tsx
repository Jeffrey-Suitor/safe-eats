import { MaterialCommunityIcons } from "@expo/vector-icons";

interface IconButtonProps {
  name: any;
  onPress: () => void;
  className?: string;
}

const IconButton = ({ name, onPress, className }: IconButtonProps) => {
  return (
    <MaterialCommunityIcons.Button
      className={className}
      name={name}
      onPress={onPress}
      backgroundColor="#FFFFFF00"
      borderRadius={0}
      iconStyle={{
        marginRight: 0,
      }}
    />
  );
};

export default IconButton;
