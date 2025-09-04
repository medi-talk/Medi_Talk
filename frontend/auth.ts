import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

export async function logout(navigation: any) {
  try {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'profile']);
  } finally {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  }
}