import React, {useState} from 'react';
import {Image, View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {Asset, launchImageLibrary} from 'react-native-image-picker';

type Props = {
  disabled?: boolean;
  image?: {uri?: string};
  onPick(image: Asset): void;
};

const PhotoOfTheDay = ({onPick, image, disabled}: Props) => {
  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (!result.didCancel && result.assets?.[0]?.uri) {
      onPick(result.assets[0]);
    }
  };

  return (
    <View style={imageUploaderStyles.container}>
      {!!image?.uri && (
        <Image source={{uri: image.uri}} style={{width: 200, height: 200}} />
      )}
      <View style={imageUploaderStyles.uploadBtnContainer}>
        <TouchableOpacity
          disabled={disabled}
          onPress={pickImage}
          style={imageUploaderStyles.uploadBtn}>
          <Text>Select Photo</Text>
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
