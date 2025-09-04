// DrugInfoScreen.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';

type Drug = {
  id: string;
  name: string;
  purpose: string;
  ingredient: string;
  manufacturer: string;
};

const DEMO_DRUGS: Drug[] = [
  { id: '1', name: '타이레놀 500mg', purpose: '해열·진통', ingredient: '아세트아미노펜 500mg', manufacturer: '한국얀센' },
  { id: '2', name: '이부프로펜 200mg', purpose: '소염·진통', ingredient: '이부프로펜 200mg', manufacturer: '일반의약품(여러 제조사)' },
  { id: '3', name: '알레그라', purpose: '알레르기 비염 완화', ingredient: '펙소페나딘', manufacturer: '사노피' },
];

export default function DrugInfoScreen() {
  const [q, setQ] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const data = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return DEMO_DRUGS;
    return DEMO_DRUGS.filter(
      d =>
        d.name.toLowerCase().includes(k) ||
        d.purpose.toLowerCase().includes(k) ||
        d.ingredient.toLowerCase().includes(k) ||
        d.manufacturer.toLowerCase().includes(k)
    );
  }, [q]);

  const toggleFav = (id: string) =>
    setFavorites(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev]));

  const renderItem = ({ item }: { item: Drug }) => {
    const fav = favorites.includes(item.id);
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.row}>효능: <Text style={styles.muted}>{item.purpose}</Text></Text>
          <Text style={styles.row}>성분: <Text style={styles.muted}>{item.ingredient}</Text></Text>
          <Text style={styles.row}>제조/유통: <Text style={styles.muted}>{item.manufacturer}</Text></Text>
        </View>
        <TouchableOpacity onPress={() => toggleFav(item.id)} style={styles.favBtn}>
          <Icon name={fav ? 'heart' : 'heart-outline'} size={22} color={fav ? '#ff5b77' : COLORS.gray} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.safe}>
      <View style={styles.search}>
        <Icon name="magnify" size={20} color={COLORS.gray} />
        <TextInput
          style={styles.input}
          value={q}
          onChangeText={setQ}
          placeholder="제품명/성분/효능으로 검색"
          placeholderTextColor={COLORS.gray}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.muted}>검색 결과가 없어요 (데모 데이터 기준)</Text>
          </View>
        }
      />

      <Text style={styles.notice}>
        ※실제 의약 정보는 반드시 공신력 있는 출처/전문의 상담을 확인하세요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.lightGray, padding: SIZES.padding },
  search: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: SIZES.radius, paddingHorizontal: 12, height: 46, marginBottom: 10,
  },
  input: { marginLeft: 8, flex: 1, ...FONTS.p, color: COLORS.darkGray },
  card: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: SIZES.padding,
    marginBottom: SIZES.base * 2, flexDirection: 'row', alignItems: 'center', elevation: 2,
  },
  name: { ...FONTS.h3, color: COLORS.darkGray, marginBottom: 6 },
  row: { ...FONTS.p, color: COLORS.darkGray },
  muted: { color: COLORS.gray },
  favBtn: { padding: 6, marginLeft: 8 },
  empty: { alignItems: 'center', marginTop: '40%' },
  notice: { ...FONTS.p, color: COLORS.gray, textAlign: 'center', marginTop: 8 },
});