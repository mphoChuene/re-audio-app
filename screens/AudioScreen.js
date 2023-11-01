import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button,Image } from "react-native";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import recordingImage from "../assets/recording.jpg"
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import onAuthStateChanged
import { app, db } from "../firebaseConfig";
import { Audio } from "expo-av";

export default function AudioScreen() {
  const [recording, setRecording] = useState();
  const [recordings, setRecordings] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);
  const [userEmail, setUserEmail] = useState(null); // State to store the user's email

  useEffect(() => {
    const auth = getAuth(app);

    // Use onAuthStateChanged to listen for changes in the user's authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setUserEmail(user.email); // Set the user's email in state
      } else {
        // User is signed out
        setUserEmail(null); // Clear the user's email from state
      }
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  async function startRecording() {
    if (currentSound) {
      await currentSound.stopAsync();
    }

    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
      }
    } catch (err) {
      // Handle errors
    }
  }

  async function stopRecording() {
    setRecording(undefined);

    await recording.stopAndUnloadAsync();
    let allRecordings = [...recordings];
    const { sound, status } = await recording.createNewLoadedSoundAsync();

    // Upload the recording to Firebase
    const docRef = await addDoc(collection(db, "recordings"), {
      duration: getDurationFormatted(status.durationMillis),
      file: recording.getURI(),
    });

    allRecordings.push({
      sound: sound,
      duration: getDurationFormatted(status.durationMillis),
      file: recording.getURI(),
      firebaseDocId: docRef.id,
    });

    setRecordings(allRecordings);
  }

  function getDurationFormatted(milliseconds) {
    const minutes = milliseconds / 1000 / 60;
    const seconds = Math.round(minutes - Math.floor(minutes) * 60);
    return seconds < 10
      ? `${Math.floor(minutes)}:0${seconds}`
      : `${Math.floor(minutes)}:${seconds}`;
  }

  async function togglePlayback(sound) {
    if (isPlaying && currentSound === sound) {
      await sound.pauseAsync();
    } else {
      if (currentSound && currentSound !== sound) {
        await currentSound.stopAsync();
      }
      await sound.playAsync();
      setCurrentSound(sound);
    }
    setIsPlaying(!isPlaying);
  }

  async function clearRecordings() {
    for (const recordingLine of recordings) {
      await deleteDoc(doc(db, "recordings", recordingLine.firebaseDocId));
    }

    if (currentSound) {
      currentSound.stopAsync();
      setCurrentSound(null);
    }
    setIsPlaying(false);
    setRecordings([]);
  }

  function getRecordingLines() {
    return recordings.map((recordingLine, index) => (
      <View key={index} style={styles.row}>
        <Text style={styles.fill}>
          Recording #{index + 1} | {recordingLine.duration}
        </Text>
        <Button
          onPress={() => togglePlayback(recordingLine.sound)}
          title={
            isPlaying && currentSound === recordingLine.sound ? "Pause" : "Play"
          }
        />
      </View>
    ));
  }

  return (
    <View style={styles.container}>
      <Image source={recordingImage} style={{ width:'100%', height: 300, marginBottom:50}}/>
      {userEmail && ( // Render the user's email if available
        <Text style={styles.welcomeMessage}>
          Welcome, {userEmail}! {/* Display the user's email */}
        </Text>
      )}
      <Button
        title={recording ? "Stop Recording" : "Start Recording\n"}
        onPress={recording ? stopRecording : startRecording}
      />
      {getRecordingLines()}
      {recordings.length > 0 && (
        <Button title="Clear Recordings" onPress={clearRecordings} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeMessage: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginRight: 40,
  },
  fill: {
    flex: 1,
    margin: 15,
  },
});
