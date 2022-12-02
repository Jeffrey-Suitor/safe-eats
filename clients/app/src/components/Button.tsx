import { styled } from "nativewind";
import { Pressable, PressableProps, Text, TextProps } from "react-native";

type PropsWithoutConflicts = Omit<PressableProps, "children" | "style"> &
  Omit<TextProps, "onLongPress" | "onPress" | "onPressIn" | "onPressOut">;

interface ButtonProps extends PropsWithoutConflicts {
  className?: string;
}

const TwText = styled(Text);

function Button({
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
}: ButtonProps) {
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
}

export default Button;
