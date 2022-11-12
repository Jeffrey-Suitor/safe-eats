import { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { Button } from "react-native";
import { trpc } from "../utils/trpc";
import { useAuth } from "../components/AuthContext";

WebBrowser.maybeCompleteAuthSession();

function LoginPage() {
  const { isAuthenticating, googleSignIn } = useAuth();

  return (
    <Button
      disabled={isAuthenticating}
      title="Login"
      onPress={() => {
        googleSignIn();
      }}
    />
  );
}

export default LoginPage;
