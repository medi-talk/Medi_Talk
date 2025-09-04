import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

//계시판 API연동할떄 코드 수정해야하는 부분 있음!!!!
const dummyDetails = {
  id: '1',
  category: '복약 관련',
  title: '타이레놀은 공복에 먹어도 되나요?',
  author: '홍길동',
  createdAt: '2025-05-26',
  answers: [
    {
      id: 'a1',
      responder: '이순신 약사',
      content: '공복에도 복용은 가능하나, 가급적 식후 복용을 권장드립니다.',
      createdAt: '2025-05-27',
    },
    {
      id: 'a2',
      responder: '강감찬 의사',
      content: '위장 장애가 없는 경우에는 공복 복용도 가능합니다.',
      createdAt: '2025-05-28',
    },
  ],
};

export default function QuestionDetailScreen({ route }: any) {
  const { questionId } = route.params;

  
  const question = dummyDetails; //api연동시 코드 수정 해야할 부분 

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.category}>[{question.category}]</Text>
      <Text style={styles.title}>{question.title}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>작성자: {question.author}</Text>
        <Text style={styles.metaText}>{question.createdAt}</Text>
      </View>
      

      <View style={styles.divider} />

      <Text style={styles.answerHeader}>답변 ({question.answers.length})</Text>
      {question.answers.map((ans) => (
        <View key={ans.id} style={styles.answerCard}>
          <View style={styles.meta}>
            <Text style={styles.metaText}>{ans.responder}</Text>
            <Text style={styles.metaText}>{ans.createdAt}</Text>
          </View>
          <Text style={styles.answerContent}>{ans.content}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.writeButton}>
        <Text style={styles.writeButtonText}>답변 작성</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  category: { color: '#0066cc', fontSize: 14, marginBottom: 5 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  metaText: { fontSize: 12, color: '#666' },
  content: { fontSize: 16, marginBottom: 20, lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 10 },
  answerHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  answerCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  answerContent: { fontSize: 14, color: '#333' },
  writeButton: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  writeButtonText: { color: '#fff', fontSize: 16 },
});