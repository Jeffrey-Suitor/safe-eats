import {
  useEffect,
  useState,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
} from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { trpc } from "../utils/trpc";
import { User } from "@safe-eats/types/userTypes";
import { useNavigation } from "@react-navigation/native";
import { setJwt } from "../utils/trpc";
import { LoginInfo, SignUpInfo } from "@safe-eats/types/userTypes";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextInterface {
  user: User | null;
  googleSignIn: () => void;
  isAuthenticating: boolean;
  setUser: Dispatch<SetStateAction<User | null>>;
  passwordSignIn: (login: LoginInfo) => void;
  passwordSignUp: (signup: SignUpInfo) => void;
}

const AuthContext = createContext<AuthContextInterface>({
  user: null,
  googleSignIn: () => {},
  isAuthenticating: false,
  setUser: () => {},
  passwordSignIn: (login: LoginInfo) => {},
  passwordSignUp: (signup: SignUpInfo) => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: JSX.Element }) => {
  const navigation = useNavigation<any>();

  const [user, setUser] = useState<null | User>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const { mutate: googleAuth } = trpc.user.googleAuth.useMutation({
    onMutate: () => {
      setIsAuthenticating(true);
    },
    onSuccess: ({ jwt, user }) => {
      setUser(user);
      setJwt(jwt);
      navigation.navigate("Appliances");
    },
    onSettled: () => {
      setIsAuthenticating(false);
    },
  });
  const [_, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    expoClientId:
      "600679286779-fppu5b515elfvaruo945urr4lf4q58ev.apps.googleusercontent.com",
  });
  useEffect(() => {
    if (googleResponse?.type === "success") {
      const { access_token } = googleResponse.params;
      googleAuth(access_token);
    }
  }, [googleResponse]);

  const { mutate: passwordSignInMut } = trpc.user.passwordSignIn.useMutation({
    onMutate: () => {
      setIsAuthenticating(true);
    },
    onSuccess: ({ jwt, user }) => {
      setUser(user);
      setJwt(jwt);
      navigation.navigate("Appliances");
    },
    onSettled: () => {
      setIsAuthenticating(false);
    },
  });

  const { mutate: passwordSignUpMut } = trpc.user.passwordSignUp.useMutation({
    onMutate: () => {
      setIsAuthenticating(true);
    },
    onSuccess: ({ jwt, user }) => {
      setUser(user);
      setJwt(jwt);
      navigation.navigate("Appliances");
    },
    onSettled: () => {
      setIsAuthenticating(false);
    },
  });

  const passwordSignIn = (l: LoginInfo) => passwordSignInMut(l);
  const passwordSignUp = (s: SignUpInfo) => passwordSignUpMut(s);

  return (
    <AuthContext.Provider
      value={{
        user,
        googleSignIn: googlePromptAsync,
        isAuthenticating,
        setUser,
        passwordSignIn,
        passwordSignUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
