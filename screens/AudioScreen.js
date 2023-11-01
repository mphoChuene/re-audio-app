import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { app, db } from "../firebaseConfig";
import { Audio } from "expo-av";

export default function AudioScreen() {
  const [recording, setRecording] = useState();
  const [recordings, setRecordings] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);

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
    const seconds = Math.round((minutes - Math.floor(minutes)) * 60);
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
    return recordings.map((recordingLine, index) => {
      return (
        <View key={index} style={styles.row}>
          <Text style={styles.fill}>
            Recording #{index + 1} | {recordingLine.duration}
          </Text>
          <Button
            onPress={() => togglePlayback(recordingLine.sound)}
            title={
              isPlaying && currentSound === recordingLine.sound
                ? "Pause"
                : "Play"
            }></Button>
        </View>
      );
    });
  }

  return (
    <View style={styles.container}>
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
