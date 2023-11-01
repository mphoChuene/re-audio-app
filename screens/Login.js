import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { signInWithEmailAndPassword, getAuth } from "@firebase/auth";
import app from '../firebaseConfig'

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth(app); // Initialize the auth instance

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Successfully logged in
    } catch (error) {
      console.log("Login Error:", error);
      // Handle login error
    }
  };

  return (
    <View>
      <Text>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <Button title="Login" onPress={handleLogin} />
      <Text onPress={() => navigation.navigate("Register")}>
        Don't have an account? Register here.
      </Text>
    </View>
  );
};

export default LoginScreen;
