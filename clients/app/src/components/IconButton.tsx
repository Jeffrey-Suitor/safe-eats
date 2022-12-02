import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native";
interface IconButtonProps {
  icon: any;
  onPress: () => void;
  classes?: string;
  children?: string;
  size?: number;
  color?: string;
  disabled?: boolean;
  textClasses?: string;
}

const IconButton = ({
  icon,
  onPress,
  classes,
  children,
  size = 24,
  color = "white",
  disabled = false,
  textClasses = "",
}: IconButtonProps) => (
  <MaterialCommunityIcons.Button
    className={classes}
    name={icon}
    size={size}
    onPress={onPress}
    backgroundColor="#FFFFFF00"
    underlayColor="#FFFFFF00"
    borderRadius={0}
    color={color}
    disabled={disabled}
    iconStyle={{
      marginRight: children ? 10 : 0,
    }}
  >
    <Text className={textClasses}>{children}</Text>
  </MaterialCommunityIcons.Button>
);

export default IconButton;
