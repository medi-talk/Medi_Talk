import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function StartScreen({ navigation } : any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medi_Talk</Text>
      <Text style={styles.subtitle}>약물 복용 도우미 앱에 오신 것을 환영합니다!</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
