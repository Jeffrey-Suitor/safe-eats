import { View, Text, TextInput as ReactTextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface TextInputProps {
  label: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  value?: string;
  errorText?: string;
  showError?: boolean;
  wrapperClasses?: string;
  autoComplete?: "email" | "password" | "off";
}
function TextInput({
  label,
  onChangeText,
  placeholder,
  keyboardType,
  value,
  errorText,
  showError,
  wrapperClasses = "",
  autoComplete = "off",
}: TextInputProps) {
  const errorDependentStyles = showError
    ? "border-red-400 pr-10 text-red-900 placeholder-red-400 focus:border-red-400 focus:outline-none focus:ring-red-400"
    : "border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500";
  const classes = [
    errorDependentStyles,
    "block w-full rounded-md border-solid border sm:text-sm p-1 pl-4",
  ].join(" ");

  return (
    <View className={wrapperClasses}>
      <Text className="block text-sm font-medium text-gray-700">{label}</Text>
      <View className="mt-1">
        <ReactTextInput
          className={classes}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          value={value}
          autoComplete={autoComplete}
        />
        {showError && (
          <View className="pointer-events-none absolute inset-y-0 right-0 flex items-center p-2 pr-3">
            <MaterialIcons name="error-outline" size={24} color="red" />
          </View>
        )}
      </View>
      {showError && (
        <Text className="mt-2 text-sm text-red-600">{errorText}</Text>
      )}
    </View>
  );
}

export default TextInput;
