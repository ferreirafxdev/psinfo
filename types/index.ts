export interface PriorityLevel {
  purple: number;
  yellow: number;
  green: number;
  purpleTime: string;
  yellowTime: string;
  greenTime: string;
}

export interface EmergencyRoomData {
  type: 'PSA' | 'PSI' | 'PSO';
  name: string;
  patientsOnScreen: number;
  firstAttendance: number;
  priorityLevels: PriorityLevel;
  triageCount: number;
  triageTime: string;
}

// Represents a single patient record as assumed from the API response.
// Adjust this interface based on the actual API response structure.
export interface ApiPatient {
  classificacao: 'ROXA' | 'AMARELA' | 'VERDE' | 'AZUL' | string;
  dataChegada: string; // ISO date string e.g., "2025-01-20T10:30:00"
}
