import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
} from 'react-native';

import { COLORS, SIZES, FONTS } from './styles/theme'; //store appStore에 저장된 스타일 불러오기 

export default function LoginScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Medi_Talk</Text>
          <Text style={styles.subtitle}>로그인하고 맞춤형 복약 관리를 시작하세요.</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="아이디 (이메일)"
          placeholderTextColor={COLORS.gray}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor={COLORS.gray}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupPrompt}>아직 회원이 아니신가요?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupText}> 회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    padding: SIZES.padding,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 2,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  subtitle: {
    ...FONTS.p,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: SIZES.base * 2,
    ...FONTS.p,
    color: COLORS.darkGray,
    borderWidth: 0,
  },
  loginButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.base,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.padding * 2,
  },
  signupPrompt: {
    ...FONTS.p,
    color: COLORS.gray,
  },
  signupText: {
    ...FONTS.p,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});