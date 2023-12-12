import React, {useCallback, useEffect, useState} from 'react';
import {Alert, ActivityIndicator} from 'react-native';
import PhotoOfTheDay from './PhotoOfTheDay';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import storage, {FirebaseStorageTypes} from '@react-native-firebase/storage';
import {Asset} from 'react-native-image-picker';
import styled from 'styled-components/native';

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
    setIsSaving(false);
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
      Alert.alert('Error saving');
      reset();
    }
    setIsSaving(false);
  }, [dateStr, reset]);

  useEffect(() => {
    checkOldDiary();
  }, [checkOldDiary]);

  return (
    <>
      <ContentWrapper>
        <StoryDateContent>
          <FlexBox1>
            <TextContent>Story date</TextContent>
          </FlexBox1>
          <FlexBox2>
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              is24Hour
              //Unchanging contents while saving diary
              disabled={isSaving}
              onChange={e => setDate(new Date(e.nativeEvent.timestamp))}
            />
          </FlexBox2>
        </StoryDateContent>
        <SelfDescContent
          value={selfDesc}
          onChangeText={selfDesc => setSelfDesc(selfDesc)}
          //Unchanging contents while saving diary
          editable={!isSaving}
          placeholder="Self Descriptive for Today"
        />
        <DiaryContent
          onChangeText={text => setText(text)}
          value={text}
          placeholder="Start telling the good things here~"
          //Unchanging contents while saving diary
          editable={!isSaving}
          multiline
        />
      </ContentWrapper>
      <PhotoOfTheDay onPick={setImage} image={image} disabled={isSaving} />
      <FinalButton onPress={saveToFb} disabled={isSaving}>
        {isSaving && <ActivityIndicator size="small" color="gray" />}
        <FinalButtonText>
          {isSaved ? 'Save edited diary' : 'Save diary'}
        </FinalButtonText>
      </FinalButton>
    </>
  );
};

export default Diary;
const ContentWrapper = styled.View`
  align-items: stretch;
  width: 70%;
`;

const TextContent = styled.Text`
  font-size: 30px;
  color: white;
  font-family: 'AmaticSC-Bold';
`;

const StoryDateContent = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 20px;
`;

const FlexBox1 = styled.View`
  display: flex;
`;

const FlexBox2 = styled.View`
  display: flex;
`;

const SelfDescContent = styled.TextInput`
  margin-bottom: 10px;
  border: 1px gray;
  padding: 5px;
  margin-bottom: 20px;
`;

const DiaryContent = styled.TextInput`
  margin-bottom: 10px;
  border: 1px gray;
  height: 120px;
  padding: 5px;
  margin-bottom: 20px;
`;

const FinalButton = styled.TouchableOpacity`
  flex-direction: row;
`;

const FinalButtonText = styled.Text`
  font-size: 30px;
  color: white;
  font-family: 'AmaticSC-Bold';
  margin: 20px;
`;
