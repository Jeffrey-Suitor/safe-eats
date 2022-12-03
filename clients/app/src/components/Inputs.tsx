import {
  View,
  Text,
  TextInput as ReactTextInput,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const baseBorderStyles =
  "border-solid border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500";

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
export const TextInput = ({
  label,
  onChangeText,
  placeholder,
  keyboardType,
  value,
  errorText,
  showError,
  wrapperClasses = "",
  autoComplete = "off",
}: TextInputProps) => {
  const classes = [
    baseBorderStyles,
    "block w-full rounded-md sm:text-sm p-1 pl-4 h-10",
    showError
      ? "border-red-400 pr-10 text-red-900 placeholder-red-400 focus:border-red-400 focus:outline-none focus:ring-red-400"
      : "",
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
};

export const DropDown = ({
  label,
  selectedOption,
  onChange,
  options,
  showDropDown = false,
  setShowDropDown,
  wrapperClasses = "",
  dropDownClasses = "",
}: {
  label?: string;
  selectedOption: string;
  onChange: (value: string) => void;
  options: string[];
  showDropDown: boolean;
  setShowDropDown: () => void;
  wrapperClasses?: string;
  dropDownClasses?: string;
}) => {
  const buttonClasses = [
    baseBorderStyles,
    "rounded-md sm:text-sm p-2 flex-row justify-between items-center h-10 pr-6",
    dropDownClasses,
  ].join(" ");

  return (
    <View className={wrapperClasses}>
      {label && (
        <Text className="block text-sm font-medium text-gray-700">{label}</Text>
      )}
      <View className="mt-1">
        <Pressable className={buttonClasses} onPress={setShowDropDown}>
          <Text className="w-full text-center">{selectedOption}</Text>
          <MaterialCommunityIcons
            name={showDropDown ? "chevron-up" : "chevron-down"}
            size={16}
          />
        </Pressable>
        {showDropDown && (
          <View
            className={
              "absolute w-full divide-y divide-gray-300 rounded-md border border-gray-300 bg-white" +
              ` ${dropDownClasses} ${showDropDown ? "z-10" : "z-0"}`
            }
          >
            {options
              .sort((a, b) => {
                if (a === selectedOption) return -1;
                if (b === selectedOption) return 1;
                return 0;
              })
              .map((option) => (
                <Pressable
                  key={option}
                  className={
                    "h-10 p-2  pr-6" +
                    (option === selectedOption
                      ? " flex-row items-center justify-between bg-indigo-100"
                      : "")
                  }
                  onPress={() => {
                    onChange(option);
                    setShowDropDown();
                  }}
                >
                  <Text className="w-full text-center">{option}</Text>
                  {option === selectedOption && (
                    <MaterialCommunityIcons
                      name={showDropDown ? "chevron-up" : "chevron-down"}
                      size={16}
                    />
                  )}
                </Pressable>
              ))}
          </View>
        )}
      </View>
    </View>
  );
};

interface TextInputWithDropDownProps extends TextInputProps {
  showDropDown: boolean;
  setShowDropDown: () => void;
  options: string[];
  selectedOption: string;
  onChange: (value: string) => void;
}

export const TextInputWithDropDown = ({
  label,
  onChangeText,
  placeholder,
  keyboardType,
  value,
  errorText,
  showError,
  wrapperClasses = "",
  autoComplete = "off",
  showDropDown,
  setShowDropDown,
  options,
  selectedOption,
  onChange,
}: TextInputWithDropDownProps) => {
  const textClasses = [
    baseBorderStyles,
    "block sm:text-sm p-2 pl-4 border-0 h-full grow",
  ].join(" ");

  return (
    <View className={wrapperClasses}>
      <Text className="block text-sm font-medium text-gray-700">{label}</Text>
      <View
        className={`${baseBorderStyles} mt-1 flex h-10 w-full flex-row items-center justify-between rounded-md ${
          showDropDown ? "z-10" : "z-0"
        }`}
        // className={
        //   "absolute w-full flex-row divide-y divide-gray-300 rounded-md border border-gray-300 bg-white" +
        // }
      >
        <ReactTextInput
          className={textClasses}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          value={value}
          autoComplete={autoComplete}
        />
        <DropDown
          wrapperClasses="w-28 p-0 -mt-1"
          selectedOption={selectedOption}
          options={options}
          showDropDown={showDropDown}
          setShowDropDown={setShowDropDown}
          onChange={onChange}
          dropDownClasses={`border-0 rounded-none ${
            showDropDown ? "border-1" : "border-l-[1px]"
          }`}
        />
      </View>
    </View>
  );
};
