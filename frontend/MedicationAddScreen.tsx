import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, StatusBar, Switch, Platform, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES, FONTS } from './styles/theme';
import { useAppStore } from './store/appStore';

function fmt(date: Date) {
  return date.toISOString().split('T')[0];
}

export default function MedicationAddScreen({ navigation }: any) {
  const { addLinked } = useAppStore();

  const [medicationName, setMedicationName] = useState('');
  const [alarmFlag, setAlarmFlag] = useState(true);

  // 복용 기간 (선택)
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // 유통기한(폐기 알림)
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState<null | 'start' | 'end' | 'expiry'>(null);

  // 복용 간격(분) → 타이머
  const [intervalStr, setIntervalStr] = useState('480'); // 약물 복용시간 8시간 단위 시간 수정 가능 

  const openPicker = (which: 'start' | 'end' | 'expiry') => setShowPicker(which);

  const onChangeDate = (_: any, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(null);
    if (!selected || !showPicker) return;
    if (showPicker === 'start') setStartDate(selected);
    if (showPicker === 'end') setEndDate(selected);
    if (showPicker === 'expiry') setExpiryDate(selected);
  };

  const handleSave = () => {
    if (!medicationName.trim()) {
      Alert.alert('안내', '약 이름을 입력하세요.');
      return;
    }
    const iv = parseInt(intervalStr, 10);
    if (isNaN(iv) || iv <= 0) {
      Alert.alert('안내', '복용 간격(분)을 올바르게 입력하세요.');
      return;
    }

    // 전역 스토어에 "타이머 + 폐기 알림 + 약 목록"을 동시 생성
    addLinked({
      name: medicationName.trim(),
      intervalMin: iv,
      expiry: fmt(expiryDate),
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      alarmFlag,
    });

    Alert.alert('완료', '약이 등록되었어요. 타이머/폐기 알림/나의 복용 약에 반영됩니다.', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.title}>복용 약 추가</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>어떤 약을 드시나요?</Text>
        <TextInput
          style={styles.input}
          placeholder="약 이름을 입력하세요 (예: 타이레놀)"
          placeholderTextColor={COLORS.gray}
          value={medicationName}
          onChangeText={setMedicationName}
        />

        <Text style={styles.label}>복용 기간 (선택)</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateInput} onPress={() => openPicker('start')}>
            <Text style={styles.inputText}>{fmt(startDate)}</Text>
          </TouchableOpacity>
          <Text style={styles.dateSeparator}>~</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => openPicker('end')}>
            <Text style={styles.inputText}>{fmt(endDate)}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>복용 간격 (타이머)</Text>
        <View style={styles.inlineRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="분 단위 (예: 480)"
            placeholderTextColor={COLORS.gray}
            value={intervalStr}
            keyboardType="numeric"
            onChangeText={setIntervalStr}
          />
          <Text style={{ ...FONTS.p, color: COLORS.gray, marginLeft: 8 }}>분</Text>
        </View>

        <Text style={styles.label}>유통기한 (폐기 알림)</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => openPicker('expiry')}>
          <Text style={styles.inputText}>{fmt(expiryDate)}</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={showPicker === 'start' ? startDate : showPicker === 'end' ? endDate : expiryDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeDate}
          />
        )}

        <Text style={styles.label}>알림을 받으시겠어요?</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>복용 시간 알람</Text>
          <Switch
            value={alarmFlag}
            onValueChange={setAlarmFlag}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        
        <View style={{ height: 100 }} />
      </ScrollView>

      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButtonBottom} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: SIZES.base, paddingBottom: SIZES.base,
  },
  backButton: { padding: SIZES.base },
  container: { padding: SIZES.padding, paddingBottom: 20 },
  title: { ...FONTS.h2, color: COLORS.darkGray, textAlign: 'center' },
  label: { ...FONTS.h3, color: COLORS.darkGray, marginBottom: SIZES.base * 1.5, marginTop: SIZES.base * 2 },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.8,
    ...FONTS.p,
    color: COLORS.darkGray,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateInput: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.8,
    flex: 1,
  },
  dateSeparator: { ...FONTS.h1, color: COLORS.gray, marginHorizontal: SIZES.base },
  inputText: { ...FONTS.p, color: COLORS.darkGray, textAlign: 'center' },
  inlineRow: { flexDirection: 'row', alignItems: 'center' },
  switchContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: { ...FONTS.p, color: COLORS.darkGray },

  footer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.base,
    paddingBottom: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 10,
  },
  saveButtonBottom: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding * 0.9,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  saveButtonText: { ...FONTS.h3, color: COLORS.white },
});