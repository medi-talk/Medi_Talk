import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';

type Family = {
  id?: string;
  name: string;
  relation: string;
  note?: string;
};

const RELATIONS = ['부모', '형제자매', '자녀', '배우자', '보호자', '기타'];

export default function FamilyEditScreen({ route, navigation }: any) {
  const editing: Family | undefined = route?.params?.family;

  const [name, setName] = useState(editing?.name ?? '');
  const [relation, setRelation] = useState(editing?.relation ?? '부모');
  const [note, setNote] = useState(editing?.note ?? '');

  const isEditing = useMemo(() => !!editing?.id, [editing?.id]);

  const canSave = useMemo(() => name.trim().length > 0 && relation.trim().length > 0, [name, relation]);

  const handleSave = () => {
    if (!canSave) {
      Alert.alert('안내', '이름과 관계를 입력해주세요.');
      return;
    }
    const payload: Family = {
      ...(isEditing ? { id: editing!.id } : {}),
      name: name.trim(),
      relation: relation.trim(),
      note: note.trim() || undefined,
    };

    if (isEditing) {
      navigation.navigate('Family', { edited: payload });
    } else {
      navigation.navigate('Family', { added: payload });
    }
  };

  const handleDelete = () => {
    if (!isEditing || !editing?.id) return;
    Alert.alert('삭제', '정말 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive',
        onPress: () => navigation.navigate('Family', { removedId: editing.id })
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
     
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.hBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.hTitle}>{isEditing ? '가족 정보 수정' : '가족 추가'}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.hBtn}>
          <Text style={{ ...FONTS.h3, color: COLORS.primary }}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          placeholder="이름을 입력하세요"
          placeholderTextColor={COLORS.gray}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>관계</Text>
        <View style={styles.relationWrap}>
          {RELATIONS.map(r => {
            const active = relation === r;
            return (
              <TouchableOpacity key={r} style={[styles.chip, active && styles.chipActive]} onPress={() => setRelation(r)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{r}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>복약 메모 (선택)</Text>
        <TextInput
          style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
          placeholder="예) 고혈압 약 복용, 오전 9시/오후 9시 알림"
          placeholderTextColor={COLORS.gray}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity style={[styles.saveBtn, { opacity: canSave ? 1 : 0.5 }]} onPress={handleSave} disabled={!canSave}>
          <Text style={styles.saveTxt}>저장</Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity style={styles.delBtn} onPress={handleDelete}>
            <Text style={styles.delTxt}>삭제</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding / 2, paddingTop: SIZES.base, paddingBottom: SIZES.base,
  },
  hBtn: { padding: SIZES.padding / 2, minWidth: 40, alignItems: 'center' },
  hTitle: { ...FONTS.h2, color: COLORS.darkGray },

  container: { paddingHorizontal: SIZES.padding, paddingBottom: SIZES.padding * 2 },
  label: { ...FONTS.h3, color: COLORS.darkGray, marginTop: SIZES.base * 2, marginBottom: SIZES.base },
  input: {
    backgroundColor: COLORS.lightGray, borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.75, ...FONTS.p, color: COLORS.darkGray,
  },

  relationWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.lightGray, marginBottom: 8,
  },
  chipActive: { backgroundColor: COLORS.primary + '22' },
  chipText: { ...FONTS.p, color: COLORS.darkGray },
  chipTextActive: { color: COLORS.primary, fontWeight: 'bold' },

  saveBtn: {
    backgroundColor: COLORS.primary, padding: SIZES.padding * 0.9, borderRadius: SIZES.radius,
    alignItems: 'center', marginTop: SIZES.padding, elevation: 6,
  },
  saveTxt: { ...FONTS.h3, color: COLORS.white },

  delBtn: {
    backgroundColor: COLORS.lightGray, padding: SIZES.padding * 0.9, borderRadius: SIZES.radius,
    alignItems: 'center', marginTop: SIZES.base,
  },
  delTxt: { ...FONTS.h3, color: COLORS.danger },
});