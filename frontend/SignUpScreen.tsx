// SignUpScreen.tsx

import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Platform, Switch, SafeAreaView, ScrollView, StatusBar
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS, SIZES, FONTS } from './styles/theme';

export default function SignUpScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birth, setBirth] = useState('');
    const [gender, setGender] = useState('남자');
    const [nationality, setNationality] = useState('내국인');
    const [phonenumber, setPhonenumber] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [pregnant, setPregnant] = useState(false);
    const [feeding, setFeeding] = useState(false);

    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        if (date) {
            setSelectedDate(date);
            setBirth(date.toISOString().split('T')[0]);
        }
    };

    const handleSignUp = () => {
        console.log('SignUp Data:', { name, email, password, birth, gender, phonenumber });
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.darkGray} />
                </TouchableOpacity>
                <Text style={styles.title}>회원가입</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.subtitle}>기본 정보를 입력해주세요.</Text>

                <TextInput style={styles.input} placeholder="이메일" placeholderTextColor={COLORS.gray} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="비밀번호" placeholderTextColor={COLORS.gray} value={password} onChangeText={setPassword} secureTextEntry />
                <TextInput style={styles.input} placeholder="이름" placeholderTextColor={COLORS.gray} value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="휴대폰 번호" placeholderTextColor={COLORS.gray} value={phonenumber} onChangeText={setPhonenumber} keyboardType="phone-pad" />
                
                <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
                    <Text style={[styles.inputText, { color: birth ? COLORS.darkGray : COLORS.gray }]}>
                        {birth || '생년월일 선택'}
                    </Text>
                    <Icon name="calendar-month-outline" size={20} color={COLORS.gray} />
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker value={selectedDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={handleDateChange} maximumDate={new Date()} />
                )}

                <View style={styles.pickerRow}>
                    <View style={styles.pickerContainer}>
                    
                        <Picker selectedValue={gender} onValueChange={(itemValue) => setGender(itemValue)} style={styles.pickerText} itemStyle={styles.pickerItem}>
                            <Picker.Item label="남자" value="남자" />
                            <Picker.Item label="여자" value="여자" />
                        </Picker>
                    </View>
                    <View style={styles.pickerContainer}>
                       
                        <Picker selectedValue={nationality} onValueChange={(itemValue) => setNationality(itemValue)} style={styles.pickerText} itemStyle={styles.pickerItem}>
                            <Picker.Item label="내국인" value="내국인" />
                            <Picker.Item label="외국인" value="외국인" />
                        </Picker>
                    </View>
                </View>

                {gender === '여자' && (
                    <View style={styles.optionSection}>
                        <Text style={styles.sectionTitle}>여성 건강 정보 (선택)</Text>
                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>임신 여부</Text>
                            <Switch value={pregnant} onValueChange={setPregnant} trackColor={{ false: COLORS.lightGray, true: COLORS.primary }} thumbColor={COLORS.white} />
                        </View>
                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>수유 여부</Text>
                            <Switch value={feeding} onValueChange={setFeeding} trackColor={{ false: COLORS.lightGray, true: COLORS.primary }} thumbColor={COLORS.white} />
                        </View>
                    </View>
                )}

                <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
                    <Text style={styles.buttonText}>가입 완료</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.padding / 2, paddingTop: SIZES.base, paddingBottom: SIZES.base },
    backButton: { padding: SIZES.padding / 2, width: 40 },
    container: { paddingHorizontal: SIZES.padding, paddingBottom: 50 },
    title: { ...FONTS.h2, color: COLORS.darkGray, textAlign: 'center' },
    subtitle: { ...FONTS.p, color: COLORS.gray, marginBottom: SIZES.padding },
    input: {
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        padding: SIZES.padding * 0.75,
        marginBottom: SIZES.base * 2,
        ...FONTS.p,
        color: COLORS.darkGray,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputText: { ...FONTS.p },
    pickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.base * 2, },
    pickerContainer: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        marginHorizontal: SIZES.base / 2,
        justifyContent: 'center',
    },
    
    pickerItem: { 
        height: 120, 
        color: COLORS.darkGray,
    },
    
    pickerText: {
        color: COLORS.darkGray,
    },
    optionSection: { marginBottom: SIZES.padding },
    sectionTitle: { ...FONTS.h3, color: COLORS.darkGray, marginBottom: SIZES.base },
    switchContainer: {
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.padding / 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.base,
    },
    switchLabel: { ...FONTS.p, color: COLORS.darkGray },
    signupButton: {
        backgroundColor: COLORS.primary,
        padding: SIZES.padding * 0.9,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: SIZES.base * 2,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    buttonText: { ...FONTS.h3, color: COLORS.white },
});