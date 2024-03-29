import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  ActivityIndicator,
  Text,
  Platform,
  TouchableOpacity,
} from 'react-native';
import PhotoOfTheDay from './PhotoOfTheDay';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import storage, {FirebaseStorageTypes} from '@react-native-firebase/storage';
import {Asset} from 'react-native-image-picker';
import styled from 'styled-components/native';
import InputSpinner from 'react-native-input-spinner';

type DiaryDoc = {
  date: string;
  content: string;
  activity: string;
  counting: number;
  self_description: string;
  photo_ref: string;
};

const Diary = () => {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(true);
  const [selfDesc, setSelfDesc] = useState('');
  const [activityList, setActivityList] = useState('');
  const [text, setText] = useState('');
  const [countingAct, setCountingAct] = useState(0);
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
        activity: activityList,
        counting: countingAct,
        self_description: selfDesc,
        photo_ref: imageRef.fullPath,
      });
      setIsSaving(false);
      setIsSaved(true);
    },
    [date, text, activityList, countingAct, selfDesc, dateStr],
  );

  //Firebase photos
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
    setActivityList('');
    setCountingAct(0);
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
      setActivityList(oldDiary.activity);
      setCountingAct(oldDiary.counting);
      setImage({uri: imageUri});
      setIsSaved(true);
    } catch (e) {
      Alert.alert('Error saving ' + e);
      reset();
    }
    setIsSaving(false);
  }, [dateStr, reset]);

  useEffect(() => {
    checkOldDiary();
  }, [checkOldDiary]);

  const onDateChange = useCallback(
    (_: unknown, updated?: Date) => {
      if (Platform.OS === 'android') {
        DateTimePickerAndroid.dismiss('date');
      }
      if (!updated) {
        return;
      }
      if (
        updated.getFullYear() === date.getFullYear() &&
        updated.getMonth() === date.getMonth() &&
        updated.getDate() === date.getDate()
      ) {
        return;
      }
      setDate(updated);
    },
    [date],
  );

  return (
    <>
      <StoryDateContent>
        <TextContent>Story date</TextContent>
        {Platform.OS === 'ios' ? (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            is24Hour
            //Unchanging contents while saving diary
            disabled={isSaving}
            onChange={onDateChange}
          />
        ) : (
          <TouchableOpacity
            onPress={() =>
              DateTimePickerAndroid.open({
                testID: 'dateTimePicker',
                value: date,
                mode: 'date',
                is24Hour: true,
                //Unchanging contents while saving diary
                onChange: onDateChange,
              })
            }>
            <Text>{dateStr}</Text>
          </TouchableOpacity>
        )}
      </StoryDateContent>

      <ContentWrapper>
        <SelfDescContent
          value={selfDesc}
          onChangeText={selfDesc => setSelfDesc(selfDesc)}
          //Unchanging contents while saving diary
          editable={!isSaving}
          placeholder="Self Descriptive for Today"
        />
        <ActivityListContent
          value={activityList}
          onChangeText={activityList => setActivityList(activityList)}
          //Unchanging contents while saving diary
          editable={!isSaving}
          placeholder="Memorable activities"
        />
        <DiaryContent
          onChangeText={text => setText(text)}
          value={text}
          placeholder="Start telling the good things here~"
          //Unchanging contents while saving diary
          editable={!isSaving}
          multiline
        />
        {/* <CountingActContent
          value={countingAct}
          onChangeText={countingAct => setCountingAct(countingAct)}
          //Unchanging contents while saving diary
          editable={!isSaving}
          placeholder="Count you activities!!!"
        /> */}

        <InputSpinner
          max={10}
          min={0}
          step={0.5}
          type="real"
          precision={1}
          textColor="white"
          color="#ccc8c8"
          buttonTextColor="white"
          buttonLeftText="🫰🏻"
          buttonRightText="💗"
          placeholder="Count your activities"
          placeholderTextColor="white"
          value={countingAct}
          onChange={setCountingAct}
        />
      </ContentWrapper>
      <PhotoWrap>
        <PhotoOfTheDay onPick={setImage} image={image} disabled={isSaving} />
      </PhotoWrap>
      <FinalButton onPress={saveToFb} disabled={isSaving}>
        {isSaving && <ActivityIndicator size="small" color="gray" />}
        <FinalButtonText>
          {isSaved ? 'Save edited diary' : 'Save diary'}
        </FinalButtonText>
      </FinalButton>
    </>
  );
};

const ContentWrapper = styled.View`
  align-items: stretch;
  width: 70%;
  margin-bottom: 20px;
`;

const TextContent = styled.Text`
  font-size: 30px;
  color: white;
  font-family: 'AmaticSC-Bold';
`;

const StoryDateContent = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-bottom: 20px;
`;

const SelfDescContent = styled.TextInput`
  border: 1px solid gray;
  padding: 5px;
  margin-bottom: 20px;
`;

const CountingActContent = styled.TextInput`
  border: 1px solid gray;
  padding: 5px;
  margin-bottom: 20px;
`;

const ActivityListContent = styled.TextInput`
  border: 1px solid gray;
  padding: 5px;
  margin-bottom: 20px;
`;

const DiaryContent = styled.TextInput`
  border: 1px solid gray;
  height: 120px;
  padding: 5px;
  margin-bottom: 20px;
`;

const PhotoWrap = styled.View`
  align-items: center;
`;

const FinalButton = styled.TouchableOpacity`
  justify-content: center;
  flex-direction: row;
`;

const FinalButtonText = styled.Text`
  font-size: 30px;
  color: white;
  font-family: 'AmaticSC-Bold';
  margin: 20px;
`;

export default Diary;
