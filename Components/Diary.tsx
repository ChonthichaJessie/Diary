import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  Alert,
} from 'react-native';
import PhotoOfTheDay from './PhotoOfTheDay';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import storage, {FirebaseStorageTypes} from '@react-native-firebase/storage';
import {Asset} from 'react-native-image-picker';

type DiaryDoc = {
  date: string;
  content: string;
  self_description: string;
  photo_ref: string;
};

const Diary = () => {
  const [date, setDate] = useState(new Date());
  const [selfDesc, setSelfDesc] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState<Asset | undefined>();
  //Unchanging contents while saving diary
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const dateStr = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

  const saveDoc = useCallback(
    async (imageRef: FirebaseStorageTypes.Reference) => {
      console.log('!!!', selfDesc);
      await firestore().collection<DiaryDoc>('diaries').doc(dateStr).set({
        date: dateStr,
        content: text,
        self_description: selfDesc,
        photo_ref: imageRef.fullPath,
      });
      setIsSaving(false);
      setIsSaved(true);
    },
    [date, text, selfDesc, dateStr],
  );

  const saveToFb = useCallback(async () => {
    if (!image?.uri) {
      // no image at all
      return;
    }
    setIsSaving(true);
    const photoRef = storage().ref(dateStr);

    if (!image?.fileName) {
      // have existing (unchanged) image - skip upload but still write doc
      await saveDoc(photoRef);
      return;
    }

    const task = photoRef.putFile(image.uri);
    task.on('state_changed', event => {
      console.log('!!!', event.state);
      if (event.state === 'success') {
        saveDoc(photoRef);
      } else if (event.state === 'error') {
        // TODO: show message to user
        //Unchanging contents while saving diary
        setIsSaving(false);
      }
    });
  }, [image, dateStr, saveDoc]);

  const reset = useCallback(() => {
    setText('');
    setSelfDesc('');
    setImage(undefined);
    setIsSaved(false);
  }, []);

  const checkOldDiary = useCallback(async () => {
    setIsSaving(true);
    const oldDiaryEntry = await firestore()
      .collection<DiaryDoc>('diaries')
      .doc(dateStr)
      .get();
    const oldDiary = oldDiaryEntry.data();

    if (!oldDiary) {
      return reset();
    }

    try {
      const imageUri = await storage().ref(oldDiary.photo_ref).getDownloadURL();
      setText(oldDiary.content);
      setSelfDesc(oldDiary.self_description);
      setImage({uri: imageUri});
      setIsSaved(true);
    } catch (e) {
      reset();
    }
    setIsSaving(false);
  }, [dateStr, reset]);

  useEffect(() => {
    checkOldDiary();
  }, [checkOldDiary]);

  return (
    <>
      <View>
        <Text>Story date</Text>
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour
          //Unchanging contents while saving diary
          disabled={isSaving}
          onChange={e => setDate(new Date(e.nativeEvent.timestamp))}
        />
        <TextInput
          value={selfDesc}
          onChangeText={selfDesc => setSelfDesc(selfDesc)}
          //Unchanging contents while saving diary
          editable={!isSaving}
          placeholder="Self Descriptive for Today"
        />
        <TextInput
          onChangeText={text => setText(text)}
          value={text}
          placeholder="Start telling the good things here!!!"
          //Unchanging contents while saving diary
          editable={!isSaving}
        />
      </View>
      <PhotoOfTheDay onPick={setImage} image={image} disabled={isSaving} />
      <TouchableOpacity onPress={saveToFb} disabled={isSaving}>
        <Text>{isSaved ? 'Save edited diary' : 'Save diary'}</Text>
      </TouchableOpacity>
    </>
  );
};

export default Diary;
