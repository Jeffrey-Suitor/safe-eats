import React, { useEffect, useState } from "react";
import { Button, View } from "react-native";
import { useAuth } from "../components/AuthContext";
import { HelperText, TextInput } from "react-native-paper";
import { styled } from "nativewind";
import {
  SignUpInfo,
  SignUpInfoSchema,
  LoginInfoSchema,
} from "@safe-eats/types/userTypes";

const StyledTextInput = styled(TextInput);

function LoginPage() {
  const { isAuthenticating, googleSignIn, passwordSignIn, passwordSignUp } =
    useAuth();
  const [screenType, setScreen] = useState<"login" | "signup">("login");
  const [loginInfo, setSignupInfo] = useState<SignUpInfo>({
    email: "",
    password: "",
    name: "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const [formComplete, setFormComplete] = useState(false);

  useEffect(() => {
    const result =
      screenType === "login"
        ? LoginInfoSchema.safeParse(loginInfo)
        : SignUpInfoSchema.safeParse(loginInfo);
    setFormComplete(result.success);
  });

  return (
    <View className="flex h-full w-full justify-evenly">
      <View>
        <View>
          {screenType === "signup" && (
            <View>
              <StyledTextInput
                label="Name"
                placeholder="Name"
                onChangeText={(name) =>
                  setSignupInfo((prev) => {
                    return { ...prev, name };
                  })
                }
              />
              <HelperText
                type="error"
                visible={showErrors && loginInfo.name === ""}
              >
                Please enter your name
              </HelperText>
            </View>
          )}

          <StyledTextInput
            label="Email"
            placeholder="Email"
            onChangeText={(email) =>
              setSignupInfo((prev) => {
                return { ...prev, email };
              })
            }
          />
          <HelperText
            type="error"
            visible={showErrors && loginInfo.email === ""}
          >
            Please enter a valid email
          </HelperText>
        </View>

        <View>
          <StyledTextInput
            label="Password"
            placeholder="Password"
            onChangeText={(password) =>
              setSignupInfo((prev) => {
                return { ...prev, password };
              })
            }
          />
          <HelperText
            type="error"
            visible={
              showErrors &&
              (loginInfo.password === "" || loginInfo.password.length < 8)
            }
          >
            Please enter an 8 character password
          </HelperText>
        </View>

        <Button
          disabled={isAuthenticating}
          title={screenType === "login" ? "Login" : "Sign Up"}
          onPress={() => {
            if (!formComplete) {
              setShowErrors(true);
              return;
            }
            screenType == "login"
              ? passwordSignIn(loginInfo)
              : passwordSignUp(loginInfo);
          }}
        />
      </View>

      <Button
        disabled={isAuthenticating}
        title={
          screenType === "login" ? "Login with Google" : "Sign up with Google"
        }
        onPress={() => {
          googleSignIn();
        }}
      />

      <Button
        disabled={isAuthenticating}
        title={screenType === "login" ? "Sign Up" : "Login"}
        onPress={() => {
          setScreen((prev) => (prev === "login" ? "signup" : "login"));
        }}
      />
    </View>
  );
}

export default LoginPage;
