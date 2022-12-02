import { styled } from "nativewind";
import { Pressable, PressableProps, Text, TextProps } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type PropsWithoutConflicts = Omit<PressableProps, "children" | "style"> &
  Omit<TextProps, "onLongPress" | "onPress" | "onPressIn" | "onPressOut">;

interface ButtonProps extends PropsWithoutConflicts {
  className?: string;
}

const TwText = styled(Text);

export const Button = ({
  className,
  children,
  android_disableSound,
  android_ripple,
  unstable_pressDelay,
  delayLongPress,
  disabled,
  hitSlop,
  onLongPress,
  onPress,
  onPressIn,
  onPressOut,
  pressRetentionOffset,
  testOnly_pressed,
  ...props
}: ButtonProps) => {
  return (
    <Pressable
      android_disableSound={android_disableSound}
      android_ripple={android_ripple}
      unstable_pressDelay={unstable_pressDelay}
      delayLongPress={delayLongPress}
      disabled={disabled}
      hitSlop={hitSlop}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      pressRetentionOffset={pressRetentionOffset}
      testOnly_pressed={testOnly_pressed}
    >
      <TwText className={className} {...props}>
        {children}
      </TwText>
    </Pressable>
  );
};

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

export const IconButton = ({
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
