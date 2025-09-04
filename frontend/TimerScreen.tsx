// TimerScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList,
  TouchableOpacity, TextInput, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';
import { useAppStore, TimerItem } from './store/appStore';

//약물복용 타이머 
type IntervalHandle = ReturnType<typeof setInterval>;

function formatHMS(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function TimerScreen() {
  const { state } = useAppStore();
  const [items, setItems] = useState<TimerItem[]>(state.timers);

  useEffect(() => {
    setItems(prev => {
      const prevIds = new Set(prev.map(x => x.id));
      const incoming = state.timers.filter(x => !prevIds.has(x.id));
      return incoming.length ? [...incoming, ...prev] : prev;
    });
  }, [state.timers]);

  const loopRef = useRef<IntervalHandle | null>(null);
  useEffect(() => {
    loopRef.current = setInterval(() => {
      setItems(prev =>
        prev.map(it => {
          if (!it.running) return it;
          const next = it.remainingSec - 1;
          if (next <= 0) {
            Alert.alert('알림', `[${it.name}] 복용 시간입니다!`);
            return { ...it, remainingSec: it.intervalMin * 60, running: false };
          }
          return { ...it, remainingSec: next };
        })
      );
    }, 1000);
    return () => {
      if (loopRef.current) { clearInterval(loopRef.current); loopRef.current = null; }
    };
  }, []);

  const start = (id: string) => setItems(prev => prev.map(it => it.id === id ? { ...it, running: true } : it));
  const pause = (id: string) => setItems(prev => prev.map(it => it.id === id ? { ...it, running: false } : it));
  const reset = (id: string) => setItems(prev => prev.map(it => it.id === id ? { ...it, remainingSec: it.intervalMin * 60, running: false } : it));
  const remove = (id: string) => setItems(prev => prev.filter(it => it.id !== id));

  const renderItem = ({ item }: { item: TimerItem }) => {
    const ivStr = String(item.intervalMin);
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{formatHMS(item.remainingSec)}</Text>
        </View>

        
        <View style={styles.ivBox}>
          <TextInput
            style={styles.ivInput}
            value={ivStr}
            keyboardType="numeric"
            onChangeText={t => {
              const n = parseInt(t || '0', 10);
              if (!isNaN(n) && n > 0) {
                setItems(prev => prev.map(it => it.id === item.id
                  ? { ...it, intervalMin: n, remainingSec: Math.min(it.remainingSec, n * 60) }
                  : it));
              }
            }}
          />
          <Text style={styles.ivUnit}>분</Text>
        </View>

        {item.running ? (
          <TouchableOpacity style={styles.ctrlBtn} onPress={() => pause(item.id)}>
            <Icon name="pause" size={18} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.ctrlBtn} onPress={() => start(item.id)}>
            <Icon name="play" size={18} color={COLORS.white} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: '#6c757d' }]} onPress={() => reset(item.id)}>
          <Icon name="restart" size={18} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: COLORS.danger }]} onPress={() => remove(item.id)}>
          <Icon name="trash-can-outline" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: SIZES.padding / 2 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>등록된 타이머가 없어요</Text>
            <Text style={styles.emptySub}>복약 관리 → 약 추가에서 등록하세요</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.lightGray, paddingHorizontal: SIZES.padding },
  ivBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lightGray,
    borderRadius: 10, paddingHorizontal: 8, height: 38, marginRight: 8,
  },
  ivInput: { minWidth: 48, textAlign: 'right', ...FONTS.p, color: COLORS.darkGray, paddingVertical: 0 },
  ivUnit: { ...FONTS.p, color: COLORS.gray, marginLeft: 4 },
  card: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: SIZES.padding, flexDirection: 'row', alignItems: 'center', marginTop: SIZES.base * 2, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, },
  name: { ...FONTS.h3, color: COLORS.darkGray },
  time: { ...FONTS.h2, color: COLORS.darkGray, marginTop: 4 },
  ctrlBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  empty: { flex: 1, alignItems: 'center', marginTop: '30%' },
  emptyTitle: { ...FONTS.h2, color: COLORS.darkGray },
  emptySub: { ...FONTS.p, color: COLORS.gray, marginTop: SIZES.base },
});