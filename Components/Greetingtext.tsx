import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const GreetingText = () => {
  const greetingWords = "What are you grateful\nfor today?";
  return <Text>{greetingWords}</Text>;
};

export default GreetingText;
