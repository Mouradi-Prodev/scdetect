import { Camera, CameraType, FlashMode } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image,ImageURISource } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ExpoWebGLRenderingContext } from 'expo-gl';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

import * as ImageManipulator from 'expo-image-manipulator';
import { SaveFormat } from 'expo-image-manipulator';



interface DataItem {
    disease: any;
    prediction: any;
}
export default function App() {
    const [tfReady,setTfReady] = useState(false);
    useEffect(()=>{
        const prepare = async () =>{
            await tf.ready();
            setTfReady(true);
        }
        prepare();
    })

    const loadModel = async () => {
        //await tf.setBackend('webgl');
        let model = await tf.loadLayersModel('../assets/model/model.json');
        return model;
    }


    const [model,setModel] = useState<tf.LayersModel>();
    useEffect(() => {
        const set = async ()=>{
            setModel(await loadModel());
        }
        
        
    }, []);
    const IMAGE_SIZE = 28;
    const LARGE_IMAGE_SIZE = 104;
    const LABELS = [
        'akiec',
        'bcc',
        'bkl',
        'df',
        'nv',
        'vasc',
        'mel'
    ]
    const predict = async (img: any, model: any) => {
        const cropTo = async (inputUri:any, focalSize:any) => {
            try {
                const croppedImage = await ImageManipulator.manipulateAsync(
                    inputUri,
                    [{ crop: { originX: 0.5, originY: 0.5, width: focalSize, height: focalSize } }],
                    { compress: 1, format: SaveFormat.JPEG, base64: false }
                  );
              
                  return croppedImage.uri;
            } catch (error) {
              console.error('Error cropping image:', error);
              throw error;
            }
          };
          const resizeTo = async (inputUri:any, size:any) => {
            try {
              const resizedImage = await ImageManipulator.manipulateAsync(
                inputUri,
                [{ resize: { width: size, height: size } }],
                { compress: 1, format: SaveFormat.JPEG, base64: false }
              );
          
              return resizedImage.uri;
            } catch (error) {
              console.error('Error resizing image:', error);
              throw error;
            }
          };
        let croppedImage;
        let scaledImage;
        const image = tf.tidy(() => {
            let pixelRatio = window.devicePixelRatio;
            croppedImage = cropTo(img, LARGE_IMAGE_SIZE * pixelRatio);
            scaledImage = resizeTo(croppedImage, IMAGE_SIZE);
            
            // const { width, height } = Image.resolveAssetSource({ scaledImage });
            // const pixels = tf.browser.fromPixels();

            //const batchedImage = pixels.expandDims(0);
            // Normalize the image between -1 and 1.
           // const normalizedImage = batchedImage.toFloat().div(tf.scalar(255));
           // return normalizedImage;
        });
        const prediction = model.predict(image);
        const results = await prediction.data();
        return { results, croppedImage };
    }

    const cameraRef = useRef(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [flashMode, setFlashMode] = useState(FlashMode.off);
    const [data, setData] = useState<DataItem[]>([]);
    const [capturedImage, setCapturedImage] = useState(null);

    if (!permission) {
        // Camera permissions are still loading
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    function toggleCameraType() {
        setType((current: CameraType) => (current === CameraType.back ? CameraType.front : CameraType.back));
    }

    function toggleFlashMode() {
        setFlashMode((current: FlashMode) => (current === FlashMode.off ? FlashMode.on : FlashMode.off));
    }
    async function takePicture() {
        if (cameraRef.current && isCameraReady) {
            try {
                const { uri } = await cameraRef.current.takePictureAsync({ skipProcessing: true });
                console.log('Picture taken:', uri);
                setCapturedImage(uri);
            } catch (error) {
                console.error('Error taking picture:', error);
            }
        }
    }

    function retakePicture() {
        setCapturedImage(null);
    }

    function continueWithImage() {
        // Handle continuing with the captured image as needed
        // For example, you can navigate to a new screen or perform some other action
        console.log('Continuing with the captured image:', capturedImage);
        
            const estimate = async (model:any) => {
                let { results, croppedImage } = await predict(capturedImage, model);
                let data: DataItem[] = Array.from(results).map((r: any, i) => {
                    return {
                        disease: LABELS[i],
                        prediction: (r * 100).toFixed(1) + '%',
                    }
                });
                //set state
                setData(data);
            };
             estimate(model);
            
        
        console.log("hello");
    }

    return (
        <View style={styles.container}>

            {capturedImage ? (
                <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            ) : (
                <Camera
                    useCamera2Api={true}
                    style={styles.camera} type={type} flashMode={flashMode}
                    ref={cameraRef}
                    onCameraReady={() => setIsCameraReady(true)}
                >
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={toggleFlashMode}>
                            {(flashMode === FlashMode.on) &&
                                <Ionicons name="md-flash" size={35} color="green" />}
                            {(flashMode === FlashMode.off) &&
                                <Ionicons name="md-flash-off" size={35} color="green" />}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={takePicture} disabled={!isCameraReady}>
                            <MaterialIcons name="camera" size={50} color={isCameraReady ? 'white' : 'gray'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
                            <MaterialIcons name="flip-camera-android" size={35} color="green" />
                        </TouchableOpacity>
                    </View>
                </Camera>)}

            {data && (
                <View style={styles.buttonsAfterCapture}>
                    <TouchableOpacity style={styles.button} onPress={retakePicture}>
                        <Text style={styles.buttonText}>
                            {
                                data.map((item, index) => (
                                    <div key={index}>
                                        {item.disease} {item.prediction}
                                    </div>
                                ))
                            }</Text>
                    </TouchableOpacity>

                </View>
            )}
            {capturedImage  && (
                <View style={styles.buttonsAfterCapture}>
                    <TouchableOpacity style={styles.button} onPress={retakePicture}>
                        <Text style={styles.buttonText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={continueWithImage}>
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            )}
            {!isCameraReady && <Text>Loading...</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    camera: {
        flex: 1
    },
    previewImage: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    buttonsAfterCapture: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
    },
    buttonText: {
        color: 'white',
    },
});