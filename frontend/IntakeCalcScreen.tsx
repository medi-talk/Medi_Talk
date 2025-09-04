// IntakeCalcScreen.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from './styles/theme';

function toNum(s: string) { const n = parseFloat(s); return Number.isFinite(n) ? n : NaN; }
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

export default function IntakeCalcScreen() {
  const [weight, setWeight] = useState('60');       // kg
  const [doseMgPerKg, setDoseMgPerKg] = useState('10'); // mg/kg (사용자가 입력)
  const [tabletMg, setTabletMg] = useState('500');  // 한 알 mg
  const [intervalHr, setIntervalHr] = useState('8'); // 시간 간격

  const calc = useMemo(() => {
    const w = toNum(weight), dpk = toNum(doseMgPerKg), tab = toNum(tabletMg), iv = toNum(intervalHr);
    if ([w, dpk, tab, iv].some(v => !Number.isFinite(v) || v <= 0)) return null;

    const singleMg = w * dpk;                 // 1회 mg
    const pills = singleMg / tab;             // 알 수
    const dosesPerDay = Math.floor(24 / iv);  // 하루 투여 횟수(간격 기반)
    const dailyMg = singleMg * dosesPerDay;   // 1일 총 mg (간격 기준)

    
    return {
      singleMg: Math.round(singleMg),
      pills: Math.round(pills * 100) / 100,
      dosesPerDay,
      dailyMg: Math.round(dailyMg),
    };
  }, [weight, doseMgPerKg, tabletMg, intervalHr]);

  return (
    <View style={styles.safe}>
      <Text style={styles.title}>섭취량 계산기 (일반 mg/kg)</Text>

      <Text style={styles.label}>체중(kg)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} />

      <Text style={styles.label}>1회 용량 (mg/kg)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={doseMgPerKg} onChangeText={setDoseMgPerKg} />

      <Text style={styles.label}>약 한 알 함량 (mg)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={tabletMg} onChangeText={setTabletMg} />

      <Text style={styles.label}>복용 간격 (시간)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={intervalHr} onChangeText={setIntervalHr} />

      <View style={styles.card}>
        {calc ? (
          <>
            <Text style={styles.row}>1회 용량: <Text style={styles.bold}>{calc.singleMg} mg</Text></Text>
            <Text style={styles.row}>대략 알 수: <Text style={styles.bold}>{calc.pills} 알</Text> (한 알 {tabletMg} mg 기준)</Text>
            <Text style={styles.row}>하루 횟수: <Text style={styles.bold}>{calc.dosesPerDay} 회</Text> (간격 {intervalHr}시간)</Text>
            <Text style={styles.row}>하루 총량(간격 기준): <Text style={styles.bold}>{calc.dailyMg} mg</Text></Text>
          </>
        ) : (
          <Text style={{ ...FONTS.p, color: COLORS.gray }}>모든 값을 올바르게 입력하세요.</Text>
        )}
      </View>

      <Text style={styles.notice}>
        ※제 용량은 질환/연령/제형/동반질환/병용약물 등에 따라 달라질 수 있으니 반드시 약사/의사 상담 및 공식 허가정보를 확인하세요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.lightGray, padding: SIZES.padding },
  title: { ...FONTS.h2, color: COLORS.darkGray, marginBottom: 8 },
  label: { ...FONTS.h3, color: COLORS.darkGray, marginTop: SIZES.base * 2, marginBottom: SIZES.base },
  input: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, paddingHorizontal: 12, paddingVertical: 12, ...FONTS.p, color: COLORS.darkGray },
  card: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: SIZES.padding, marginTop: SIZES.base * 2 },
  row: { ...FONTS.p, color: COLORS.darkGray, marginBottom: 6 },
  bold: { fontWeight: 'bold', color: COLORS.darkGray },
  notice: { ...FONTS.p, color: COLORS.gray, textAlign: 'center', marginTop: 10 },
});