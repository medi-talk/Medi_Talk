import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';

type Family = {
  id: string;
  name: string;
  relation: string; 
  note?: string;   
};

const initialData: Family[] = [
  { id: '1', name: '김아버지', relation: '부모', note: '고혈압 약 복용 중' },
  { id: '2', name: '이동생', relation: '형제자매' },
];

export default function FamilyListScreen({ navigation, route }: any) {
  const [members, setMembers] = useState<Family[]>(initialData);

  useEffect(() => {
    const added: Family | undefined = route?.params?.added;
    const edited: Family | undefined = route?.params?.edited;
    const removedId: string | undefined = route?.params?.removedId;

    if (added) {
      setMembers(prev => [{ ...added, id: Date.now().toString() }, ...prev]);
      navigation.setParams({ added: undefined });
    }
    if (edited) {
      setMembers(prev => prev.map(m => (m.id === edited.id ? edited : m)));
      navigation.setParams({ edited: undefined });
    }
    if (removedId) {
      setMembers(prev => prev.filter(m => m.id !== removedId));
      navigation.setParams({ removedId: undefined });
    }
  }, [route?.params?.added, route?.params?.edited, route?.params?.removedId, navigation]);

  const renderItem = ({ item }: { item: Family }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('FamilyEdit', { family: item })}
    >
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Icon name="account" size={24} color={COLORS.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>{item.relation}{item.note ? ` · ${item.note}` : ''}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {members.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>가족이 비어 있어요</Text>
            <Text style={styles.emptySub}>아래 + 버튼으로 가족을 추가해보세요</Text>
          </View>
        ) : (
          <FlatList
            data={members}
            keyExtractor={i => i.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: SIZES.padding / 2 }}
          />
        )}

        
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('FamilyEdit')}
        >
          <Icon name="plus" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.lightGray },
  container: { flex: 1 },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base * 2,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: SIZES.base },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    marginRight: SIZES.padding,
  },
  name: { ...FONTS.h3, color: COLORS.darkGray },
  sub: { ...FONTS.p, color: COLORS.gray, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...FONTS.h2, color: COLORS.darkGray },
  emptySub: { ...FONTS.p, color: COLORS.gray, marginTop: SIZES.base },
  fab: {
    position: 'absolute', right: SIZES.padding, bottom: SIZES.padding * 2,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', elevation: 8,
  },
});