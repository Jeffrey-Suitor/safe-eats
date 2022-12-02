import React, { useEffect, useState } from "react";
import { Pressable, View, Text } from "react-native";
import { useAuth } from "../components/AuthContext";
import {
  SignUpInfo,
  SignUpInfoSchema,
  LoginInfoSchema,
} from "@safe-eats/types/userTypes";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import IconButton from "../components/IconButton";

function LoginPage() {
  const { isAuthenticating, googleSignIn, passwordSignIn, passwordSignUp } =
    useAuth();
  const [screen, setScreen] = useState<"login" | "signup">("login");
  const [loginInfo, setSignupInfo] = useState<SignUpInfo>({
    email: "",
    password: "",
    name: "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const [formComplete, setFormComplete] = useState(false);

  useEffect(() => {
    setShowErrors(false);
  }, [screen]);

  useEffect(() => {
    const result =
      screen === "login"
        ? LoginInfoSchema.safeParse(loginInfo)
        : SignUpInfoSchema.safeParse(loginInfo);
    setFormComplete(result.success);
  });

  const tabStyle = (tab: "login" | "signup") => {
    const dependentStyles =
      tab === screen
        ? "border-indigo-500 text-indigo-600"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";
    return [
      "w-1/2 py-4 px-1 border-b-2 font-medium text-sm",
      dependentStyles,
    ].join(" ");
  };

  return (
    <View className="flex h-full w-full justify-between  p-4">
      <View className="w-full border-b border-gray-200">
        <View className="flex w-full flex-row">
          <Pressable
            className={tabStyle("login")}
            onPress={() => setScreen("login")}
          >
            <Text className="text-center">Login</Text>
          </Pressable>
          <Pressable
            className={tabStyle("signup")}
            onPress={() => setScreen("signup")}
          >
            <Text className="text-center">Sign Up</Text>
          </Pressable>
        </View>
      </View>

      <View>
        <TextInput
          autoComplete="email"
          wrapperClasses="my-4"
          label="Email"
          placeholder="you@example.com"
          value={loginInfo.email}
          onChangeText={(email) =>
            setSignupInfo((prev) => {
              return { ...prev, email };
            })
          }
          errorText="Please enter a valid email address"
          showError={showErrors && loginInfo.email === ""}
        />

        <TextInput
          wrapperClasses="mb-4"
          label="Password"
          value={loginInfo.password}
          onChangeText={(password) =>
            setSignupInfo((prev) => {
              return { ...prev, password };
            })
          }
          placeholder="Password"
          errorText="Please enter an 8 character password"
          showError={showErrors && loginInfo.password.length < 8}
        />

        {screen === "signup" && (
          <TextInput
            wrapperClasses="mb-4"
            label="Name"
            value={loginInfo.name}
            onChangeText={(name) =>
              setSignupInfo((prev) => {
                return { ...prev, name };
              })
            }
            placeholder="Your name"
            showError={showErrors && loginInfo.name === ""}
            errorText="Please add a name"
          />
        )}

        <Button
          className="mb-6 mt-2 rounded-md bg-indigo-500 p-2.5 text-center text-white"
          disabled={isAuthenticating}
          onPress={() => {
            if (!formComplete) {
              setShowErrors(true);
              return;
            }
            screen == "login"
              ? passwordSignIn(loginInfo)
              : passwordSignUp(loginInfo);
          }}
        >
          {screen === "login" ? "Login" : "Sign Up"}
        </Button>

        <IconButton
          textClasses="text-center text-white w-full -ml-6"
          classes="bg-indigo-500 text-center rounded-md"
          icon="google"
          disabled={isAuthenticating}
          onPress={() => {
            googleSignIn();
          }}
        >
          {screen === "login" ? "Login with Google" : "Sign up with Google"}
        </IconButton>
      </View>
      <View className="h-1/4"></View>
    </View>
  );
}

export default LoginPage;
