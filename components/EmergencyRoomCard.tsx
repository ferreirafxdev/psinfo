import { View, Text, StyleSheet } from 'react-native';
import { EmergencyRoomData } from '../types';

interface EmergencyRoomCardProps {
  data: EmergencyRoomData;
}

export function EmergencyRoomCard({ data }: EmergencyRoomCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PSA': return '#3b82f6';
      case 'PSI': return '#8b5cf6';
      case 'PSO': return '#10b981';
      default: return '#6366f1';
    }
  };

  const typeColor = getTypeColor(data.type);

  return (
    <View style={[styles.card, { borderLeftColor: typeColor }]}>
      <Text style={styles.headerText}>
        <Text style={styles.titleEmoji}>🚨</Text>
        <Text style={styles.title}> {data.type}</Text>
        <Text style={styles.dividerText}> | </Text>
        <Text style={styles.titleEmoji}>👥</Text>
        <Text style={styles.patientsCount}> Em tela: </Text>
        <Text style={styles.patientsNumber}>({data.patientsOnScreen})</Text>
      </Text>

      <Text style={styles.attendanceText}>
        <Text style={styles.titleEmoji}>🕐</Text>
        <Text style={styles.attendanceLabel}> 1º Atendimento: </Text>
        <Text style={styles.attendanceNumber}>
          ({data.firstAttendance === 0 ? 'Zerado' : data.firstAttendance})
        </Text>
      </Text>

      <View style={styles.divider} />

      <View style={styles.prioritySection}>
        <Text style={styles.priorityRow}>
          <Text>🟪 </Text>
          <Text style={styles.priorityCount}>{data.priorityLevels.purple.toString().padStart(2, '0')}</Text>
          <Text style={styles.priorityTime}> | {data.priorityLevels.purpleTime}</Text>
        </Text>

        <Text style={styles.priorityRow}>
          <Text>🟨 </Text>
          <Text style={styles.priorityCount}>{data.priorityLevels.yellow.toString().padStart(2, '0')}</Text>
          <Text style={styles.priorityTime}> | {data.priorityLevels.yellowTime}</Text>
        </Text>
        
        <Text style={styles.priorityRow}>
          <Text>🟩 </Text>
          <Text style={styles.priorityCount}>{data.priorityLevels.green.toString().padStart(2, '0')}</Text>
          <Text style={styles.priorityTime}> | {data.priorityLevels.greenTime}</Text>
        </Text>
      </View>

      {data.triageCount > 0 && (
        <>
          <View style={styles.divider} />
          <Text style={styles.triageRow}>
            <Text>📋 </Text>
            <Text style={styles.triageText}>{data.triageCount.toString().padStart(2, '0')} Triagem</Text>
            <Text style={styles.triageTime}> | {data.triageTime}</Text>
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  headerText: {
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#cbd5e1',
    alignItems: 'center',
  },
  titleEmoji: {
    fontSize: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  dividerText: {
    color: '#475569',
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
  },
  patientsCount: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
  },
  patientsNumber: {
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
    fontSize: 16,
  },
  attendanceText: {
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    color: '#cbd5e1',
    fontSize: 16,
  },
  attendanceLabel: {
    fontFamily: 'Inter_600SemiBold',
  },
  attendanceNumber: {
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 16,
  },
  prioritySection: {
    gap: 12,
  },
  priorityRow: {
    fontSize: 16,
    alignItems: 'center',
  },
  priorityCount: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
    minWidth: 30,
  },
  priorityTime: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#cbd5e1',
  },
  triageRow: {
    fontSize: 16,
    alignItems: 'center',
  },
  triageText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
  },
  triageTime: {
    fontFamily: 'Inter_400Regular',
    color: '#cbd5e1',
  },
});
