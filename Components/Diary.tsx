import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Button} from 'react-native';
import PhotoOfTheDay from './PhotoOfTheDay';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import storage, {FirebaseStorageTypes} from '@react-native-firebase/storage';
import {Asset} from 'react-native-image-picker';

const Diary = () => {
  const [date, setDate] = useState(new Date());
  const [selfDesc, setSelfDesc] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState<Asset | undefined>();
  //Unchanging contents while saving diary
  const [isSaving, setIsSaving] = useState(false);

  const saveDoc = useCallback(
    async (imageRef: FirebaseStorageTypes.Reference) => {
      const dateStr = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      await firestore().collection('diaries').doc(dateStr).set({
        date: dateStr,
        content: text,
        self_description: selfDesc,
        photo_ref: imageRef.fullPath,
      });
      setIsSaving(false);
    },
    [date, text, selfDesc],
  );

  const saveToFb = useCallback(async () => {
    if (image?.fileName || !image?.uri) {
      return;
    }
    setIsSaving(true);
    // TODO: filename should be the date
    const photoRef = storage().ref(image.fileName);
    const task = photoRef.putFile(image.uri);
    task.on('state_changed', event => {
      if (event.state === 'success') {
        saveDoc(photoRef);
      } else if (event.state === 'error') {
        // TODO: show message to user
        
        //Unchanging contents while saving diary
        setIsSaving(false);
      }
    });
  }, [image]);

  return (
    <>
      <View>
        <Text>Story date</Text>
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={'date'}
          is24Hour={true}
          //Unchanging contents while saving diary
          disabled={isSaving}
          onChange={e => setDate(new Date(e.nativeEvent.timestamp))}
        />
        <TextInput
          value={selfDesc}
          onChangeText={selfDesc => {
            setSelfDesc(selfDesc);
          }}
          //Unchanging contents while saving diary
          editable={!isSaving}
          placeholder="Self Descriptive for Today"
          
        />
        <TextInput
          onChangeText={text => {
            setText(text);
          }}
          value={text}
          placeholder="Start telling the good things here!!!"
          //Unchanging contents while saving diary
          editable={!isSaving}
        />
      </View>
      <PhotoOfTheDay onPick={setImage} image={image} />
      <TouchableOpacity onPress={saveToFb}>
        <Text>Save Diary</Text>
      </TouchableOpacity>
    </>
  );
};

export default Diary;
