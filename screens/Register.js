import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import app from "../firebaseConfig";
import {RegisterImg} from '../assets/signup.jpg'
import { createUserWithEmailAndPassword, getAuth } from "@firebase/auth";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth(app); // Initialize the auth instance

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Successfully registered and logged in
    } catch (error) {
      console.log("Registration Error:", error);
      // Handle registration error
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior="padding"
      enabled>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>
          Welcome to the audio recording app, please login.
        </Text>
        <Image source={Login} style={styles.image} />
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            value={email}
            style={styles.inputs}
            onChangeText={(text) => setEmail(text)}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            style={styles.inputs}
            onChangeText={(text) => setPassword(text)}
          />
        </View>
        <Button title="Register" onPress={handleRegister} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
  },
  image: {
    height: 200,
    width: "100%",
  },
  inputContainer: {
    width: "80%",
  },
  inputs: {
    height: 40,
    width: "100%",
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    height: 40,
    width: "80%",
    marginVertical: 10,
    backgroundColor: "dodgerblue",
  },
});

export default RegisterScreen;
