// PasswordChangeScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, StatusBar, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';

export default function PasswordChangeScreen({ navigation }: any) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 간단한 강도 측정 (길이 + 대/소문자/숫자/특수문자)
  const strength = useMemo(() => {
    let score = 0;
    if (newPw.length >= 8) score++;
    if (/[A-Z]/.test(newPw)) score++;
    if (/[a-z]/.test(newPw)) score++;
    if (/\d/.test(newPw)) score++;
    if (/[^A-Za-z0-9]/.test(newPw)) score++;
    return Math.min(score, 4); // 0~4
  }, [newPw]);

  const strengthLabel = ['약함', '보통', '좋음', '강함', '아주 강함'][strength] ?? '약함';

  const isValid = useMemo(() => {
    if (newPw !== confirmPw) return false;
    if (newPw.length < 8) return false;
    if (currentPw.length === 0) return false;
    return true;
  }, [currentPw, newPw, confirmPw]);

  const handleSubmit = () => {
    if (!isValid) {
      Alert.alert('확인', '입력값을 다시 확인해주세요.');
      return;
    }
    if (currentPw === newPw) {
      Alert.alert('안내', '현재 비밀번호와 새 비밀번호가 동일합니다.');
      return;
    }
  
    console.log('CHANGE_PASSWORD', { currentPw, newPw });
    Alert.alert('완료', '비밀번호가 변경되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>비밀번호 변경</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.helpText}>안전한 비밀번호를 사용하세요. (8자 이상, 대/소문자·숫자·특수문자 조합 권장)</Text>

       
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="현재 비밀번호"
            placeholderTextColor={COLORS.gray}
            secureTextEntry={!showCurrent}
            value={currentPw}
            onChangeText={setCurrentPw}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowCurrent(v => !v)}>
            <Icon name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="새 비밀번호 (8자 이상)"
            placeholderTextColor={COLORS.gray}
            secureTextEntry={!showNew}
            value={newPw}
            onChangeText={setNewPw}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNew(v => !v)}>
            <Icon name={showNew ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        
        <View style={styles.strengthBarWrap}>
          {[0,1,2,3].map(i => (
            <View
              key={i}
              style={[
                styles.strengthBar,
                { backgroundColor: i < strength ? COLORS.primary : COLORS.lightGray }
              ]}
            />
          ))}
        </View>
        <Text style={styles.strengthText}>비밀번호 강도: {strengthLabel}</Text>

        
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="새 비밀번호 확인"
            placeholderTextColor={COLORS.gray}
            secureTextEntry={!showConfirm}
            value={confirmPw}
            onChangeText={setConfirmPw}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(v => !v)}>
            <Icon name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        
        {newPw && confirmPw && newPw !== confirmPw && (
          <Text style={styles.warnText}>새 비밀번호와 확인이 일치하지 않습니다.</Text>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, { opacity: isValid ? 1 : 0.5 }]}
          onPress={handleSubmit}
          disabled={!isValid}
        >
          <Text style={styles.submitText}>변경하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding / 2, paddingTop: SIZES.base, paddingBottom: SIZES.base,
  },
  headerBtn: { padding: SIZES.padding / 2, width: 40, alignItems: 'center' },
  headerTitle: { ...FONTS.h2, color: COLORS.darkGray },

  container: { paddingHorizontal: SIZES.padding, paddingBottom: 60 },
  helpText: { ...FONTS.p, color: COLORS.gray, marginTop: SIZES.base, marginBottom: SIZES.padding },

  inputRow: {
    backgroundColor: COLORS.lightGray, borderRadius: SIZES.radius,
    marginBottom: SIZES.base * 2, flexDirection: 'row', alignItems: 'center',
    paddingLeft: SIZES.padding * 0.75, paddingRight: 6,
  },
  input: {
    flex: 1, ...FONTS.p, color: COLORS.darkGray, paddingVertical: 14,
  },
  eyeBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
  },

  strengthBarWrap: { flexDirection: 'row', gap: 6, marginTop: -8 },
  strengthBar: { flex: 1, height: 6, borderRadius: 3 },
  strengthText: { ...FONTS.p, color: COLORS.gray, marginTop: SIZES.base, marginBottom: SIZES.base * 2 },

  warnText: { ...FONTS.p, color: COLORS.danger, marginBottom: SIZES.base },

  submitBtn: {
    backgroundColor: COLORS.primary, padding: SIZES.padding * 0.9, borderRadius: SIZES.radius,
    alignItems: 'center', marginTop: SIZES.base, shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8,
  },
  submitText: { ...FONTS.h3, color: COLORS.white },
});