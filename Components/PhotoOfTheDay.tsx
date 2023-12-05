import React, {useState, useEffect, useCallback, useContext} from 'react';
import {Image, View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import storage, {FirebaseStorageTypes} from '@react-native-firebase/storage';

const PhotoOfTheDay = () => {
  const [fbStorage, setFbStorage] = useState<FirebaseStorageTypes.Module>();
  const [image, setImage] = useState<Asset | undefined>(undefined);

  useEffect(() => {
    setFbStorage(storage());
  }, []);

  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    console.log(result);
    if (!result.didCancel && result.assets?.[0]?.uri) {
      setImage(result.assets[0]);
    }
  };

  const photoUpload = useCallback(async () => {
    if (!fbStorage || !image?.fileName || !image?.uri) {
      return;
    }
    // TODO: filename should be the date
    const photoRef = fbStorage.ref(image.fileName);
    const task = photoRef.putFile(image.uri);
    task.on('state_changed', event => {
      if (event.state === 'success') {
        // TODO: write diary (including photoRef.fullPath) to firebase database
      } else if (event.state === 'error') {
        // TODO: show message to user
        setImage(undefined);
      }
    });
  }, [fbStorage, image]);

  useEffect(() => {
    photoUpload();
  }, [photoUpload]);

  return (
    <View style={imageUploaderStyles.container}>
      {!!image?.uri && (
        <Image source={{uri: image.uri}} style={{width: 200, height: 200}} />
      )}
      <View style={imageUploaderStyles.uploadBtnContainer}>
        <TouchableOpacity
          disabled={!!image}
          onPress={pickImage}
          style={imageUploaderStyles.uploadBtn}>
          <Text>Upload Photo</Text>
          {/* <AntDesign name="camera" size={20} color="black" /> */}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const imageUploaderStyles = StyleSheet.create({
  container: {
    elevation: 2,
    height: 200,
    width: 200,
    backgroundColor: '#efefef',
    position: 'relative',
    borderRadius: 999,
    overflow: 'hidden',
  },
  uploadBtnContainer: {
    opacity: 0.7,
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'lightgrey',
    width: '100%',
    height: '25%',
  },
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PhotoOfTheDay;
