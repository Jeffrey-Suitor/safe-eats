import {
  View,
  Text,
  TextInput as ReactTextInput,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";

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
  const classes = [
    "w-full rounded-md border-solid border sm:text-sm p-1 pl-4",
    dropDownClasses,
  ].join(" ");

  return (
    <View className={wrapperClasses}>
      {label && (
        <Text className="block text-sm font-medium text-gray-700">{label}</Text>
      )}
      <View className="mt-1">
        <Pressable className={classes} onPress={setShowDropDown}>
          <Text>{selectedOption}</Text>
        </Pressable>
        {showDropDown && (
          <View className="absolute z-10 w-full rounded-md border border-gray-300 bg-white shadow-md">
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
                    "p-2" + (option === selectedOption ? " bg-indigo-100" : "")
                  }
                  onPress={() => {
                    onChange(option);
                    setShowDropDown();
                  }}
                >
                  <Text>{option}</Text>
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
  const errorDependentStyles = showError
    ? "border-red-400 pr-10 text-red-900 placeholder-red-400 focus:border-red-400 focus:outline-none focus:ring-red-400"
    : "border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500";
  const classes = [errorDependentStyles, "block sm:text-sm p-1 pl-4"].join(" ");

  return (
    <View className={wrapperClasses}>
      <Text className="block text-sm font-medium text-gray-700">{label}</Text>
      <View className="relative mt-1 flex w-4/5 flex-row rounded-md border border-solid shadow-sm">
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
        <DropDown
          wrapperClasses="h-full w-min border-transparent bg-transparent text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm w-full"
          selectedOption={selectedOption}
          options={options}
          showDropDown={showDropDown}
          setShowDropDown={setShowDropDown}
          onChange={onChange}
          dropDownClasses="rounded-none p-2"
        />
      </View>

      {showError && (
        <Text className="mt-2 text-sm text-red-600">{errorText}</Text>
      )}
    </View>
  );
};
