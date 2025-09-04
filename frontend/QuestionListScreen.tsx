import React, { useLayoutEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet
} from 'react-native';

const dummyQuestions = [
  {
    id: '1',
    category: '복약 관련',
    title: '타이레놀은 공복에 먹어도 되나요?',
    author: '홍길동',
    createdAt: '2025-05-26',
    answers: 2,
  },
  {
    id: '2',
    category: '부작용 문의',
    title: '약 먹고 피부가 가려워졌어요',
    author: '김기열',
    createdAt: '2025-05-27',
    answers: 0,
  },
];

export default function QuestionListScreen({ navigation }: any) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('QuestionWriteScreen')}>
          <Text style={{ color: '#0066cc', fontSize: 16, marginRight: 15 }}>질문 작성</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('QuestionDetail', { questionId: item.id })}
    >
      <Text style={styles.category}>[{item.category}]</Text>
      <Text style={styles.title}>{item.title}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>작성자: {item.author}</Text>
        <Text style={styles.metaText}>{item.createdAt}</Text>
        <Text style={styles.metaText}>답변 {item.answers}개</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyQuestions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  category: { color: '#0066cc', fontSize: 14, marginBottom: 5 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 12, color: '#666' },
});
