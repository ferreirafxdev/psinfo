import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { EmergencyRoomCard } from '../components/EmergencyRoomCard';
import { fetchEmergencyRoomData } from '../services/api';
import { EmergencyRoomData } from '../types';

SplashScreen.preventAutoHideAsync();

export default function HomeScreen() {
  const [data, setData] = useState<EmergencyRoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const loadData = useCallback(async () => {
    try {
      const result = await fetchEmergencyRoomData();
      setData(result);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    
    const interval = setInterval(() => {
      loadData();
    }, parseInt(process.env.EXPO_PUBLIC_REFRESH_INTERVAL || '30000'));

    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏥 Painel de Controle</Text>
        <Text style={styles.headerSubtitle}>Pronto Socorro</Text>
        <Text style={styles.lastUpdate}>
          Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {data.map((room, index) => (
          <EmergencyRoomCard key={index} data={room} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    marginBottom: 12,
  },
  lastUpdate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
