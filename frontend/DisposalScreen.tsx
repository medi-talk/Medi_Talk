// DisposalScreen.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';
import { useAppStore } from './store/appStore';

function diffDays(expiryISO: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const ex = new Date(expiryISO); ex.setHours(0,0,0,0);
  const ms = ex.getTime() - today.getTime();
  return Math.round(ms / (1000*60*60*24));
}
function badgeColor(d: number) {
  if (d <= 0) return COLORS.danger;
  if (d <= 7) return '#FF9F43';
  return COLORS.gray;
}

export default function DisposalScreen() {
  const { state, removeDisposal } = useAppStore();

  const sorted = useMemo(
    () => [...state.disposals].sort((a, b) => diffDays(a.expiry) - diffDays(b.expiry)),
    [state.disposals]
  );

  const remove = (id: string) => {
    Alert.alert('삭제', '이 항목을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => removeDisposal(id) },
    ]);
  };

  const renderItem = ({ item }: { item: { id: string; name: string; expiry: string } }) => {
    const d = diffDays(item.expiry);
    const color = badgeColor(d);
    const label = d === 0 ? 'D-Day' : (d < 0 ? `D+${Math.abs(d)}` : `D-${d}`);
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>유통기한 {item.expiry}</Text>
        </View>
        <View style={[styles.badge, { borderColor: color }]}>
          <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
        <TouchableOpacity onPress={() => remove(item.id)} style={{ marginLeft: 8 }}>
          <Icon name="trash-can-outline" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
    
      <FlatList
        data={sorted}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: SIZES.padding / 2 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>등록된 항목이 없어요</Text>
            <Text style={styles.emptySub}>복약 관리 → 약 추가에서 유통기한을 등록하세요</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.lightGray, paddingHorizontal: SIZES.padding },
  card: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: SIZES.padding, flexDirection: 'row', alignItems: 'center', marginTop: SIZES.base * 2, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, },
  name: { ...FONTS.h3, color: COLORS.darkGray },
  sub: { ...FONTS.p, color: COLORS.gray, marginTop: 2 },
  badge: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { ...FONTS.p },
  empty: { flex: 1, alignItems: 'center', marginTop: '30%' },
  emptyTitle: { ...FONTS.h2, color: COLORS.darkGray },
  emptySub: { ...FONTS.p, color: COLORS.gray, marginTop: SIZES.base },
});