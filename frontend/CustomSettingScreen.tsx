
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Switch,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS, SIZES, FONTS } from './styles/theme';

const SettingsRow = ({ icon, title, isSwitch, switchValue, onSwitchChange, onPress }: {
    icon: string;
    title: string;
    isSwitch?: boolean; 
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    onPress?: () => void;
}) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={isSwitch}>
        <View style={styles.rowLeft}>
            <Icon name={icon} size={24} color={COLORS.darkGray} style={styles.icon} />
            <Text style={styles.rowTitle}>{title}</Text>
        </View>
        {isSwitch ? (
            <Switch
                value={switchValue}
                onValueChange={onSwitchChange}
                trackColor={{ false: COLORS.gray + '50', true: COLORS.primary }}
                thumbColor={COLORS.white}
            />
        ) : (
            <Icon name="chevron-right" size={24} color={COLORS.gray} />
        )}
    </TouchableOpacity>
);

export default function CustomSettingScreen({ navigation }: any) {
    // 알림 설정 상태 (나중에 실제 기능과 연동 필요)
    const [medicationAlarm, setMedicationAlarm] = useState(true);
    const [familyAlarm, setFamilyAlarm] = useState(false);

    const handleLogout = () => {
        Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
            { text: "취소", style: "cancel" },
            { text: "확인", onPress: () => navigation.replace('Login') } // 로그인 화면으로 이동
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert("회원 탈퇴", "모든 정보가 영구적으로 삭제됩니다. 정말 탈퇴하시겠습니까?", [
            { text: "취소", style: "cancel" },
            { text: "확인", onPress: () => console.log("Account deleted"), style: 'destructive' }
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <ScrollView style={styles.container}>
                <Text style={styles.headerTitle}>설정</Text>
                
                
                <Text style={styles.sectionTitle}>계정 관리</Text>
                <SettingsRow icon="account-edit-outline" title="프로필 수정" onPress={() => navigation.navigate('ProfileEdit')} />
                <SettingsRow icon="lock-outline" title="비밀번호 변경" onPress={() => { navigation.navigate('PasswordChange')}} />

               
                <Text style={styles.sectionTitle}>알림 설정</Text>
                <SettingsRow 
                    icon="bell-ring-outline" 
                    title="복약 알림" 
                    isSwitch={true} 
                    switchValue={medicationAlarm} 
                    onSwitchChange={setMedicationAlarm} 
                />
                <SettingsRow 
                    icon="account-multiple-outline" 
                    title="가족 알림" 
                    isSwitch={true} 
                    switchValue={familyAlarm} 
                    onSwitchChange={setFamilyAlarm} 
                />

              
                <Text style={styles.sectionTitle}>가족 관리</Text>
                <SettingsRow icon="heart-outline" title="가족 목록 보기" onPress={() => navigation.navigate('Family')} />

            
                <Text style={styles.sectionTitle}>기타</Text>
                <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
                    <Text style={styles.actionText}>로그아웃</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionRow} onPress={handleDeleteAccount}>
                    <Text style={[styles.actionText, { color: COLORS.danger }]}>회원 탈퇴</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    container: { flex: 1 },
    headerTitle: { ...FONTS.h1, paddingHorizontal: SIZES.padding, paddingTop: SIZES.padding, paddingBottom: SIZES.base },
    sectionTitle: { ...FONTS.p, color: COLORS.gray, paddingHorizontal: SIZES.padding, marginTop: SIZES.padding, marginBottom: SIZES.base },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.padding * 0.75,
        backgroundColor: COLORS.lightGray,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.white,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: SIZES.padding },
    rowTitle: { ...FONTS.p, color: COLORS.darkGray },
    actionRow: {
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.padding * 0.75,
        backgroundColor: COLORS.lightGray,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.white,
    },
    actionText: { ...FONTS.p, color: COLORS.primary },
});