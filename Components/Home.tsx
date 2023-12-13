import React, {useState} from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import GreetingText from './Greetingtext';
import Diary from './Diary';
import styled from 'styled-components/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const Home = () => {
  const [open, setOpen] = useState(false);

  return (
    <Page>
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: '#f7ced2',
      }}>
      <Header>
        <GreetingText />
      </Header>

      {open ? (
          <Diary />
      ) : (
        <TouchableOpacity onPress={() => setOpen(true)}>
          <Header>+</Header>
        </TouchableOpacity>
      )}
    </KeyboardAwareScrollView>
    </Page>
  );
};

export default Home;

const Page = styled.View`
  background-color: #f7ced2;
  flex: 1;
`;

const Header = styled.Text`
  font-size: 40px;
  text-align: center;
  margin: 20px;
  color: white;
  font-family: 'AmaticSC-Bold';
`;


