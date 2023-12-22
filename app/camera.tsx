import { Camera, CameraType ,WhiteBalance } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View,Modal, Pressable, Dimensions, ActivityIndicator } from 'react-native';

import React from 'react';

import {
    getModel,
    convertBase64ToTensor,
    startPrediction,
  } from '../assets/helpers/tensor-helper';
  import {cropPicture} from '../assets/helpers/image-helper';

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
    probability: string; 
  };
export default function App() {
    const cameraRef = useRef();
    const [isProcessing, setIsProcessing] = useState(false);
    const [presentedShape, setPresentedShape] = useState('');
    const [probability,setProbability] = useState('')
    const [result, setResult] = useState<Result[]>([]);
    const handleImageCapture = async () => {
      setIsProcessing(true);
      //@ts-ignore
      const imageData = await cameraRef?.current?.takePictureAsync({
        base64: true,
      });
      processImagePrediction(imageData);
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
  
        <Camera
        
        //@ts-ignore
          ref={cameraRef}
          style={styles.camera}
          type={CameraType.back}
          autoFocus={true}
          whiteBalance={WhiteBalance.auto}></Camera>
        <Pressable
          onPress={() => handleImageCapture()}
          style={styles.captureButton}></Pressable>
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    camera: {
      width: '100%',
      height: '100%',
    },
    captureButton: {
      position: 'absolute',
      left: Dimensions.get('screen').width / 2 - 50,
      bottom: 40,
      width: 100,
      zIndex: 100,
      height: 100,
      backgroundColor: 'white',
      borderRadius: 50,
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
    resultsContainer: {
      position: 'absolute',
      top: 20,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: 10,
      borderRadius: 10,
      zIndex: 100,
    },
  });