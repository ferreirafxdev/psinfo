import { EmergencyRoomData, ApiPatient } from '../types';

// --- CONFIGURAÇÃO ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const DEPARTMENTS = {
  PSA: { id: 3, name: 'Pronto Socorro Adulto' },
  PSI: { id: 4, name: 'Pronto Socorro Infantil' },
  PSO: { id: 33, name: 'Pronto Socorro Ortopédico' },
};

// --- FUNÇÕES AUXILIARES ---

/**
 * Busca dados de uma URL de forma segura, validando se a resposta é JSON.
 * @param url A URL para buscar os dados.
 * @returns A resposta JSON parseada.
 */
async function safeFetchJson(url: string): Promise<any> {
  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro de rede: ${response.status}. Resposta: ${errorBody.slice(0, 200)}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const responseText = await response.text();
    if (responseText.trim().startsWith('<!DOCTYPE')) {
      throw new Error('A API retornou uma página HTML em vez de JSON. Verifique se a URL está correta e se há necessidade de autenticação ou acesso via VPN/rede específica.');
    }
    throw new Error(`Resposta inesperada do servidor (tipo: ${contentType}). Esperava JSON.`);
  }
  
  try {
    return await response.json();
  } catch (error) {
    const e = error as Error;
    throw new Error(`Falha ao analisar a resposta JSON. Erro: ${e.message}`);
  }
}

function calculateTimeDifference(startTime: string | Date): string {
  try {
    const start = new Date(startTime);
    const now = new Date();
    if (isNaN(start.getTime())) return '00:00 min';

    const diffMs = now.getTime() - start.getTime();
    if (diffMs < 0) return '00:00 min';

    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} min`;
  } catch {
    return '00:00 min';
  }
}

function processPatientList(patientList: ApiPatient[]) {
  const priorities = {
    purple: { count: 0, oldestTime: new Date() },
    yellow: { count: 0, oldestTime: new Date() },
    green: { count: 0, oldestTime: new Date() },
  };

  if (!Array.isArray(patientList)) {
    return {
      total: 0,
      priorityCounts: { purple: 0, yellow: 0, green: 0 },
      priorityTimes: { purpleTime: '00:00 min', yellowTime: '00:00 min', greenTime: '00:00 min' },
    };
  }

  patientList.forEach(patient => {
    const arrivalTime = new Date(patient.dataChegada);
    if (isNaN(arrivalTime.getTime())) return;

    switch (patient.classificacao.toUpperCase()) {
      case 'ROXA':
        priorities.purple.count++;
        if (arrivalTime < priorities.purple.oldestTime) priorities.purple.oldestTime = arrivalTime;
        break;
      case 'AMARELA':
        priorities.yellow.count++;
        if (arrivalTime < priorities.yellow.oldestTime) priorities.yellow.oldestTime = arrivalTime;
        break;
      case 'VERDE':
        priorities.green.count++;
        if (arrivalTime < priorities.green.oldestTime) priorities.green.oldestTime = arrivalTime;
        break;
    }
  });

  return {
    total: patientList.length,
    priorityCounts: {
      purple: priorities.purple.count,
      yellow: priorities.yellow.count,
      green: priorities.green.count,
    },
    priorityTimes: {
      purpleTime: priorities.purple.count > 0 ? calculateTimeDifference(priorities.purple.oldestTime) : '00:00 min',
      yellowTime: priorities.yellow.count > 0 ? calculateTimeDifference(priorities.yellow.oldestTime) : '00:00 min',
      greenTime: priorities.green.count > 0 ? calculateTimeDifference(priorities.green.oldestTime) : '00:00 min',
    }
  };
}

async function fetchDepartmentData(type: 'PSA' | 'PSI' | 'PSO', id: number, name: string): Promise<EmergencyRoomData> {
  const attendanceUrl = `${API_BASE_URL}/filaDeAtendimentoProntoSocorroV2/${id}/Pronto%20Socorro`;
  const triageUrl = `${API_BASE_URL}/filaDeAtendimentoProntoSocorroV2/${id}/Triagem`;

  const [attendanceData, triageData] = await Promise.all([
    safeFetchJson(attendanceUrl),
    safeFetchJson(triageUrl),
  ]);

  const attendancePatients: ApiPatient[] = attendanceData.pacientes || [];
  const triagePatients: ApiPatient[] = triageData.pacientes || [];

  const processedAttendance = processPatientList(attendancePatients);
  
  const triageCount = triagePatients.length;
  const triageTime = triageCount > 0 
    ? calculateTimeDifference(triagePatients.reduce((oldest, p) => new Date(p.dataChegada) < new Date(oldest.dataChegada) ? p : oldest, triagePatients[0]).dataChegada)
    : '00:00 min';

  return {
    type,
    name,
    patientsOnScreen: attendanceData.emTela || 0,
    firstAttendance: processedAttendance.total,
    priorityLevels: {
      ...processedAttendance.priorityCounts,
      ...processedAttendance.priorityTimes,
    },
    triageCount,
    triageTime,
  };
}

export async function fetchEmergencyRoomData(): Promise<EmergencyRoomData[]> {
  if (!API_BASE_URL || API_BASE_URL.includes('YOUR_API_URL')) {
    console.warn('URL da API não configurada. Usando dados mock.');
    return getMockData();
  }

  try {
    const departmentPromises = Object.entries(DEPARTMENTS).map(([type, { id, name }]) => 
      fetchDepartmentData(type as 'PSA' | 'PSI' | 'PSO', id, name)
    );

    const results = await Promise.allSettled(departmentPromises);
    
    const rooms: EmergencyRoomData[] = [];
    results.forEach((result, index) => {
      const type = Object.keys(DEPARTMENTS)[index] as 'PSA' | 'PSI' | 'PSO';
      if (result.status === 'fulfilled') {
        rooms.push(result.value);
      } else {
        console.error(`Falha ao buscar dados para ${type}:`, result.reason.message);
        rooms.push(getEmptyData(type, DEPARTMENTS[type].name));
      }
    });

    return rooms;

  } catch (error) {
    console.error('Erro geral na API, retornando mock data:', error);
    return getMockData();
  }
}

// --- DADOS DE FALLBACK ---

function getEmptyData(type: 'PSA' | 'PSI' | 'PSO', name: string): EmergencyRoomData {
  return {
    type,
    name,
    patientsOnScreen: 0,
    firstAttendance: 0,
    priorityLevels: { purple: 0, yellow: 0, green: 0, purpleTime: '00:00 min', yellowTime: '00:00 min', greenTime: '00:00 min' },
    triageCount: 0,
    triageTime: '00:00 min',
  };
}

function getMockData(): EmergencyRoomData[] {
  return [
    {
      type: 'PSA',
      name: 'Pronto Socorro Adulto',
      patientsOnScreen: 14,
      firstAttendance: 10,
      priorityLevels: { purple: 0, yellow: 1, green: 5, purpleTime: '00:00 min', yellowTime: '00:12 min', greenTime: '00:13 min' },
      triageCount: 4,
      triageTime: '00:05 min',
    },
    {
      type: 'PSI',
      name: 'Pronto Socorro Infantil',
      patientsOnScreen: 5,
      firstAttendance: 3,
      priorityLevels: { purple: 0, yellow: 0, green: 0, purpleTime: '00:00 min', yellowTime: '00:00 min', greenTime: '00:00 min' },
      triageCount: 3,
      triageTime: '00:13 min',
    },
    {
      type: 'PSO',
      name: 'Pronto Socorro Ortopédico',
      patientsOnScreen: 2,
      firstAttendance: 0,
      priorityLevels: { purple: 0, yellow: 0, green: 0, purpleTime: '00:00 min', yellowTime: '00:00 min', greenTime: '00:00 min' },
      triageCount: 0,
      triageTime: '00:00 min',
    },
  ];
}
