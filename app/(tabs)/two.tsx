import { ActivityIndicator, Modal, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import Header from '../../components/Header';
import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';


import {
  getModel,
  convertBase64ToTensor,
  startPrediction,
} from '../../assets/helpers/tensor-helper';
import {cropPicture} from '../../assets/helpers/image-helper';

const DISEASE_MAPPING:{
  [key: string]:string,

}= {
  'akiec': 'Actinic Keratosis',
  'bcc': 'Basal Cell Carcinoma',
  'bkl': 'Benign Keratosis-like Lesion',
  'df': 'Dermatofibroma',
  'nv': 'Melanocytic Nevi',
  'vasc': 'Vascular Lesion',
  'mel': 'Melanoma',
};
const RESULT_MAPPING = [ 
  'akiec',
'bcc',
'bkl',
'df',
'nv',
'vasc',
'mel'];
type Result = {
  disease: string;
  full_name: string;
  probability: string; // Adjust the type to match the actual type of probability
};
export default function TabTwoScreen() {

  
  const [selectedImage, setSelectedImage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [presentedShape, setPresentedShape] = useState('');

  const [result, setResult] = useState<Result[]>([]);
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      base64:true,
      quality: 1,
    });

    if (!result.canceled) {
      setIsProcessing(true);
      //console.log(result)
      setSelectedImage(result.assets[0].uri);
     // console.log(selectedImage)
      processImagePrediction(result.assets[0]);
    } else {
      alert('You did not select any image.');
    }
  };
 
  const processImagePrediction = async (base64Image: any) => {
    const croppedData = await cropPicture(base64Image, 28);
    const model = await getModel();
    const tensor = await convertBase64ToTensor(croppedData?.base64);
    

    const prediction = await startPrediction(model, tensor);
    console.log(prediction)

    // const result = prediction.map((probability: any, index: any) => ({
    //   disease: RESULT_MAPPING[index],
    //   probability: probability,
    // }));
    const resultArray = RESULT_MAPPING.map((disease, index) => ({
      disease: disease,
      full_name: DISEASE_MAPPING[disease],
      probability: (prediction[index] * 100).toFixed(2) + '%',
    }));

    console.log(resultArray)
    setResult(resultArray);

    const highestPrediction = prediction.indexOf(
      Math.max.apply(null, prediction),
    );
    //setProbability(result.probability)
    setPresentedShape(RESULT_MAPPING[highestPrediction]);
  };
  return (
    <View style={styles.container}>
       <Modal visible={isProcessing} transparent={true} animationType="slide">
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              {/* <Text>Current predicted disease is {presentedShape} </Text>
              {probability && (<Text>Probability: {probability}</Text>)} */
              }
              <View>
                {result.map((item, index) => (
                  <Text key={index}>
                    {item.full_name}: {item.probability}
                  </Text>
                ))}
              </View>
              {presentedShape === '' && <ActivityIndicator size="large" />}
              <Pressable
                style={styles.dismissButton}
                onPress={() => {
                  setResult([]);
                  setPresentedShape('');
                  setIsProcessing(false);
                }}>
                <Text>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      <Header name="Skin Cancer Detection" />
      <Text style={styles.title}>Upload a Picture</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Pressable onPress={pickImageAsync}>
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
  dismissButton: {
    width: 150,
    height: 50,
    marginTop: 60,
    borderRadius: 24,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
  },
  modal: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    height: 300,
    borderRadius: 24,
    backgroundColor: 'gray',
  },
});
