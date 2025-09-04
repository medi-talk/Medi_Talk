import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function QuestionWriteScreen({ navigation} : any) {
  const [category, setCategory] = useState('복약 관련');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('제목과 내용을 입력해주세요.');
      return;
    }

    Alert.alert('질문이 등록되었습니다.');
    setTitle('');
    setContent('');

    navigation.navigate('QuestionListScreen'); 

  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>질문 작성</Text>

      <Text style={styles.label}>카테고리</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          <Picker.Item label="복약 관련" value="복약 관련" />
          <Picker.Item label="부작용 문의" value="부작용 문의" />
          <Picker.Item label="영양제 상담" value="영양제 상담" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="제목을 입력하세요"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.textArea}
        placeholder="질문 내용을 입력하세요"
        value={content}
        onChangeText={setContent}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>등록</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#f0f8ff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0066cc', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 10, backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, height: 150, textAlignVertical: 'top', backgroundColor: '#fff', marginBottom: 20,
  },
  button: {
    backgroundColor: '#0066cc', padding: 15, borderRadius: 10, alignItems: 'center',
  },
  buttonText: {
    color: '#fff', fontSize: 16, fontWeight: 'bold',
  },
});
