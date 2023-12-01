import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import Header from '../../components/Header';
import { Link } from 'expo-router';
import React from 'react';


export default function TabOneScreen() {


  return (
    <View style={styles.container}>
      <Header name="Skin Cancer Detection" />
      <Text style={styles.title}>Take a Picture</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <Link href="/camera">
       
          <Ionicons name="md-camera-sharp" size={39} color='green' />
       
      </Link>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
