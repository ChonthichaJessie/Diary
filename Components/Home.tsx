import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import GreetingText from './Greetingtext';
import Diary from './Diary';

const Home = () => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <GreetingText />
      {open ? (
        <>
          <Diary />
          <TouchableOpacity onPress={() => setOpen(false)}>
            <Text>Home</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity onPress={() => setOpen(true)}>
          <Text>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
