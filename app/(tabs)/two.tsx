import { Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import Header from '../../components/Header';



export default function TabTwoScreen() {
  function UploadPermission(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <View style={styles.container}>
      <Header name="Skin Cancer Detection" />
      <Text style={styles.title}>Upload a Picture</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Pressable onPress={UploadPermission}>
      <FontAwesome name="file-image-o" size={39} color="green" />
          
        </Pressable>
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
