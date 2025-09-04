// InteractionScreen.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';

type Rule = { a: string; b: string; level: '주의' | '금기' | '정보'; note: string };

//api 완성되면 가져와서 수정하면 됨
const DEMO_RULES: Rule[] = [
  { a: '와파린', b: '아스피린', level: '주의', note: '출혈 위험 증가 가능 (데모)' },
  { a: '와파린', b: '이부프로펜', level: '주의', note: '출혈/위장관 자극 (데모)' },
  { a: '아스피린', b: '이부프로펜', level: '정보', note: '진통 효과 영향 가능 (데모)' },
  { a: 'MAOI', b: '수도에페드린', level: '금기', note: '고혈압 위기 위험 (데모)' },
];

function norm(s: string) {
  return s.trim().toLowerCase();
}

export default function InteractionScreen() {
  const [input, setInput] = useState('');
  const [items, setItems] = useState<string[]>([]);

  const add = () => {
    const k = input.trim();
    if (!k) return;
    if (!items.map(norm).includes(norm(k))) setItems(prev => [k, ...prev]);
    setInput('');
  };
  const remove = (name: string) => setItems(prev => prev.filter(i => i !== name));

  const results = useMemo(() => {
    const names = items.map(norm);
    const findings: Rule[] = [];
    for (const r of DEMO_RULES) {
      const A = norm(r.a), B = norm(r.b);
      if (names.includes(A) && names.includes(B)) findings.push(r);
    }
    return findings;
  }, [items]);

  const levelColor = (lv: Rule['level']) => (lv === '금기' ? COLORS.danger : lv === '주의' ? '#FF9F43' : COLORS.gray);

  return (
    <View style={styles.safe}>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="약물명 입력 후 추가 (예: 와파린, 아스피린)"
          placeholderTextColor={COLORS.gray}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={add}
        />
        <TouchableOpacity style={styles.addBtn} onPress={add}>
          <Icon name="plus" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      
      <View style={styles.chips}>
        {items.map(n => (
          <View key={n} style={styles.chip}>
            <Text style={styles.chipTxt}>{n}</Text>
            <TouchableOpacity onPress={() => remove(n)} style={{ marginLeft: 6 }}>
              <Icon name="close" size={16} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      
      <FlatList
        data={results}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.a} + {item.b}</Text>
            <Text style={[styles.level, { color: levelColor(item.level) }]}>{item.level}</Text>
            <Text style={styles.note}>{item.note}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.muted}>
              선택된 약물 조합에서 특이 상호작용이 없거나 (데모 룰셋 기준){'\n'}
              아직 약물을 추가하지 않았습니다.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingVertical: 8 }}
      />

      <Text style={styles.notice}>
        ※ 데모 룰셋입니다. 실제 복약/병용 전에는 약사·의사 상담 및 공식 데이터베이스를 확인하세요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.lightGray, padding: SIZES.padding },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius, paddingHorizontal: 12, height: 46,
    ...FONTS.p, color: COLORS.darkGray, marginRight: 8,
  },
  addBtn: { width: 46, height: 46, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 12, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 6 },
  chipTxt: { ...FONTS.p, color: COLORS.darkGray },
  card: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: SIZES.padding, marginBottom: SIZES.base * 2 },
  title: { ...FONTS.h3, color: COLORS.darkGray },
  level: { ...FONTS.h3, marginTop: 6 },
  note: { ...FONTS.p, color: COLORS.gray, marginTop: 4 },
  empty: { alignItems: 'center', marginTop: '40%' },
  muted: { ...FONTS.p, color: COLORS.gray, textAlign: 'center' },
  notice: { ...FONTS.p, color: COLORS.gray, textAlign: 'center', marginTop: 8 },
});