import React, {useState} from 'react';
import {View, Text, TextInput} from 'react-native';
import PhotoOfTheDay from './PhotoOfTheDay';
import DateTimePicker from '@react-native-community/datetimepicker';

import {Alert} from 'react-native';

const Diary = () => {
  const [date, setDate] = useState(new Date());
  const [selfDesc, setSelfDesc] = React.useState('');
  const [text, setText] = React.useState('');

  return (
    <>
      <View>
        <Text>Story date</Text>
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={'date'}
          is24Hour={true}
          onChange={e => setDate(new Date(e.nativeEvent.timestamp))}
        />
        <TextInput
          value={selfDesc}
          onChangeText={selfDesc => {
            setSelfDesc(selfDesc);
          }}
          placeholder="Self Descriptive for Today"
        />
        <TextInput
          onChangeText={text => {
            setText(text);
          }}
          value={text}
          placeholder="Start telling the good things here!!!"
        />
      </View>
      <PhotoOfTheDay />
    </>
  );
};

export default Diary;
