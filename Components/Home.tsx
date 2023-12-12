import React, {useState} from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import GreetingText from './Greetingtext';
import Diary from './Diary';
import styled from 'styled-components/native';

const Home = () => {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper>
      <Header>
        <GreetingText />
      </Header>

      {open ? (
        <>
          <Diary />
          {/* <TouchableOpacity onPress={() => setOpen(false)}>
            <Header>Home</Header>
          </TouchableOpacity> */}
        </>
      ) : (
        <TouchableOpacity onPress={() => setOpen(true)}>
          <Header>+</Header>
        </TouchableOpacity>
      )}
    </Wrapper>
  );
};

export default Home;

const Wrapper = styled.View`
  flex: 1;
  background-color: rgb(247, 206, 210);
  align-items: center;
  justify-content: center;
`;

const Header = styled.Text`
  font-size: 40px;
  text-align: center;
  margin: 20px;
  color: white;
  font-family: "AmaticSC-Bold";
`;
