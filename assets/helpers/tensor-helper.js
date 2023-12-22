import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import {bundleResourceIO, decodeJpeg} from '@tensorflow/tfjs-react-native';

import {Base64Binary} from '../utils/utils';
const BITMAP_DIMENSION = 28;

const modelJson = require('../model/model.json');
const modelWeights = require('../model/weights.bin');


// 3: RGB image
const TENSORFLOW_CHANNEL = 3;

export const getModel = async () => {
  try {
    // Ready tf?
    await tf.ready();
    // load Layers of the Model (the test model created using tensorflowjs)
    return await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
  } catch (error) {
    console.log('Could not load model', error);
  }
};

export const convertBase64ToTensor = async (base64) => {
  try {
    const uIntArray = Base64Binary.decode(base64);
    // decode a JPEG-encoded image to a 3D Tensor of dtype
    const decodedImage = decodeJpeg(uIntArray, TENSORFLOW_CHANNEL);
    // reshape Tensor into a 4D array
    // return decodedImage.reshape([
    //   BITMAP_DIMENSION,
    //   BITMAP_DIMENSION,
    //   TENSORFLOW_CHANNEL,
    // ]);
    return decodedImage.expandDims(); 

  } catch (error) {
    console.log('Could not convert base64 string to tesor', error);
  }
};

export const startPrediction = async (model, tensor) => {
  try {
    // predict against the model
    const output = await model.predict(tensor);
    console.log(output)
    // return typed array
    return output.dataSync();
  } catch (error) {
    console.log('Error predicting from tesor image', error);
  }
};
