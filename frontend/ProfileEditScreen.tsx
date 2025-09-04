import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, StatusBar, Platform, Switch, Alert, Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';

type ProfileData = {
  name: string;
  email: string;
  phonenumber: string;
  birth: string;
  gender: '남자' | '여자';
  nationality: '내국인' | '외국인';
  pregnant?: boolean;
  feeding?: boolean;
};

// 나중에 서버 데이터베이스 api 받아하므로 수정 필요함 이거는 예시 
const defaultProfile: ProfileData = {
  name: '홍길동',
  email: 'hong@example.com',
  phonenumber: '010-1234-5678',
  birth: '1999-09-09',
  gender: '남자',
  nationality: '내국인',
  pregnant: false,
  feeding: false,
};

export default function ProfileEditScreen({ route, navigation }: any) {
  const initial = (route?.params?.profile as ProfileData) ?? defaultProfile;

  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email); 
  const [phonenumber, setPhonenumber] = useState(initial.phonenumber);
  const [birth, setBirth] = useState(initial.birth);
  const [gender, setGender] = useState<'남자' | '여자'>(initial.gender);
  const [nationality, setNationality] = useState<'내국인' | '외국인'>(initial.nationality);
  const [pregnant, setPregnant] = useState<boolean>(!!initial.pregnant);
  const [feeding, setFeeding] = useState<boolean>(!!initial.feeding);

  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    initial.birth ? new Date(initial.birth) : new Date()
  );

  const onChangeBirth = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (date) {
      setSelectedDate(date);
      setBirth(date.toISOString().split('T')[0]);
    }
  };

  const handleSave = () => {
    const payload: ProfileData = {
      name, email, phonenumber, birth, gender, nationality, pregnant, feeding,
    };
    console.log('PROFILE_SAVE', payload);
    Alert.alert('저장 완료', '프로필이 업데이트되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  };

  const handleChangeAvatar = () => {
    Alert.alert('사진 변경', '프로필 사진 변경 기능은 이후에 연결할게요.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
          <Text style={{ ...FONTS.h3, color: COLORS.primary }}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        
        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            
            <Icon name="account" size={56} color={COLORS.white} />
          </View>
          <TouchableOpacity style={styles.avatarBtn} onPress={handleChangeAvatar}>
            <Icon name="camera-outline" size={18} color={COLORS.white} />
            <Text style={styles.avatarBtnText}>사진 변경</Text>
          </TouchableOpacity>
        </View>

        
        <Text style={styles.sectionTitle}>기본 정보</Text>
        <TextInput
          style={styles.input}
          placeholder="이름"
          placeholderTextColor={COLORS.gray}
          value={name}
          onChangeText={setName}
        />
        
        <View style={[styles.input, styles.readonlyRow]}>
          <Text style={[styles.inputText, { color: COLORS.gray }]} numberOfLines={1}>
            {email || '이메일'}
          </Text>
          <Text style={{ ...FONTS.p, color: COLORS.gray }}>(변경 불가)</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="휴대폰 번호"
          placeholderTextColor={COLORS.gray}
          value={phonenumber}
          onChangeText={setPhonenumber}
          keyboardType="phone-pad"
        />

        
        <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
          <Text style={[styles.inputText, { color: birth ? COLORS.darkGray : COLORS.gray }]}>
            {birth || '생년월일 선택'}
          </Text>
          <Icon name="calendar-month-outline" size={20} color={COLORS.gray} />
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeBirth}
            maximumDate={new Date()}
          />
        )}

        
        <View style={styles.pickerRow}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(v) => setGender(v)}
              style={styles.pickerText}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="남자" value="남자" />
              <Picker.Item label="여자" value="여자" />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={nationality}
              onValueChange={(v) => setNationality(v)}
              style={styles.pickerText}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="내국인" value="내국인" />
              <Picker.Item label="외국인" value="외국인" />
            </Picker>
          </View>
        </View>

        
        {gender === '여자' && (
          <View style={styles.optionSection}>
            <Text style={styles.sectionTitle}>여성 건강 정보 (선택)</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>임신 여부</Text>
              <Switch
                value={pregnant}
                onValueChange={setPregnant}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>수유 여부</Text>
              <Switch
                value={feeding}
                onValueChange={setFeeding}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>
        )}

        
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>저장</Text>
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
  headerBtn: { padding: SIZES.padding / 2, minWidth: 40, alignItems: 'center' },
  headerTitle: { ...FONTS.h2, color: COLORS.darkGray },
  container: { paddingHorizontal: SIZES.padding, paddingBottom: 60 },

  avatarRow: {
    alignItems: 'center', marginTop: SIZES.padding, marginBottom: SIZES.padding,
  },
  avatarCircle: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.darkGray, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, marginTop: SIZES.base * 1.5,
  },
  avatarBtnText: { ...FONTS.p, color: COLORS.white },

  sectionTitle: { ...FONTS.h3, color: COLORS.darkGray, marginBottom: SIZES.base },
  input: {
    backgroundColor: COLORS.lightGray, borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.75, marginBottom: SIZES.base * 2,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  inputText: { ...FONTS.p, color: COLORS.darkGray },
  readonlyRow: { opacity: 0.8 },

  pickerRow: { flexDirection: 'row', gap: SIZES.base, marginBottom: SIZES.base * 2 },
  pickerContainer: { flex: 1, backgroundColor: COLORS.lightGray, borderRadius: SIZES.radius },
  pickerItem: { height: 120, color: COLORS.darkGray },
  pickerText: { color: COLORS.darkGray },

  optionSection: { marginBottom: SIZES.padding },
  switchRow: {
    backgroundColor: COLORS.lightGray, borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding, paddingVertical: SIZES.padding / 2,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SIZES.base,
  },
  switchLabel: { ...FONTS.p, color: COLORS.darkGray },

  saveBtn: {
    backgroundColor: COLORS.primary, padding: SIZES.padding * 0.9, borderRadius: SIZES.radius,
    alignItems: 'center', marginTop: SIZES.base, marginBottom: SIZES.padding,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3, shadowRadius: 5, elevation: 8,
  },
  saveBtnText: { ...FONTS.h3, color: COLORS.white },
});