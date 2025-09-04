import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from './styles/theme';
import { useAppStore } from './store/appStore';

export default function MedicationListScreen({ navigation }: any) {
  const { state } = useAppStore(); 

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.iconContainer}>
        <Icon name="pill" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.medicationName}>{item.name}</Text>
        <Text style={styles.medicationPeriod}>{`${item.startDate} ~ ${item.endDate}`}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <FlatList
          data={state.medications} 
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>등록된 약이 없습니다.</Text>
              <Text style={styles.emptySubText}>아래 버튼을 눌러 첫 번째 약을 추가해보세요!</Text>
            </View>
          }
          contentContainerStyle={{ paddingTop: SIZES.padding }}
        />

        
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('MedicationAdd')}
        >
          <Icon name="plus" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightGray },
  container: { flex: 1 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base * 2,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  textContainer: { flex: 1 },
  medicationName: { ...FONTS.h3, color: COLORS.darkGray },
  medicationPeriod: { ...FONTS.p, color: COLORS.gray, marginTop: 4 },
  fab: {
    position: 'absolute',
    right: SIZES.padding,
    bottom: SIZES.padding * 2,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    marginTop: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { ...FONTS.h2, color: COLORS.darkGray },
  emptySubText: { ...FONTS.p, color: COLORS.gray, marginTop: SIZES.base },
});