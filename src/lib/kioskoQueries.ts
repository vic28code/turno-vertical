import { supabase } from './supabase';

// --- CONSTANTES ---
const DEFAULT_PRIORITY_ID = '453c0e62-5683-4420-9621-fd07ff06f521'; 

// --- INTERFACES ---
export interface CategoriaDB {
  id: string; 
  cuenta_id: string; 
  nombre: string;
  descripcion: string | null;
  tiempo_prom_seg: number; 
}

export interface KioskoDB {
  id: string; 
  codigo: string;
  sucursal_id: string; 
}

export interface ClienteDB {
  id: string; 
  cedula: string;
  nombres: string;
  apellidos: string;
  vulnerabilidad?: string | null;
}

export interface TurnoPerdidoDB {
  id: string;
  codigo: string;
  estado: string;
  cliente_id: string;
  cliente: {
    nombres: string;
    apellidos: string;
    cedula: string;
  };
}

// --- HELPER: Generador de UUID v4 para el ID del turno ---
// (Necesario porque tu BD no lo autogenera)
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para navegadores viejos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// --- QUERIES DE LECTURA ---

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categoria') 
    .select('id, cuenta_id, nombre, descripcion, tiempo_prom_seg')
    .eq('activo', true) 
    .order('nombre');

  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
  
  return data.map((cat: any) => ({
    ...cat,
    tiempo_estimado: cat.tiempo_prom_seg ? Math.ceil(cat.tiempo_prom_seg / 60) : 15,
    color: "bg-blue-600" 
  }));
};

export const getKioskos = async () => {
  const { data, error } = await supabase
    .from('kiosko') 
    .select('id, codigo, sucursal_id') 
    .eq('estado', 'activo'); 

  if (error) {
    console.error("Error fetching kioskos:", error);
    throw error;
  }
  return data;
};

export const getClienteByCedula = async (cedula: string) => {
  const { data, error } = await supabase
    .from('cliente') 
    .select('id, cedula, nombres, apellidos, vulnerabilidad')
    .eq('cedula', cedula)
    .maybeSingle(); 

  if (error) {
    console.error("Error buscando cliente:", error);
    throw error;
  }
  return data as ClienteDB | null;
};

export const getTurnoPerdido = async (codigoTurno: string) => {
  const codigo = codigoTurno.toUpperCase().trim();

  const { data, error } = await supabase
    .from('turno')
    .select(`
      id, 
      codigo, 
      estado, 
      cliente_id,
      cliente:cliente_id ( nombres, apellidos, cedula )
    `)
    .eq('codigo', codigo)
    .eq('estado', 'perdido') 
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const rawData = data as any; 
  const clienteData = Array.isArray(rawData.cliente) 
    ? rawData.cliente[0] 
    : rawData.cliente;

  return {
    ...rawData,
    cliente: clienteData || { nombres: 'Desconocido', apellidos: '', cedula: '' }
  } as TurnoPerdidoDB;
};

// --- QUERIES DE ESCRITURA (CREAR / ACTUALIZAR) ---

export const createTurn = async (turnData: any) => {
  const now = new Date();
  const expires = new Date(now.getTime() + 2 * 60 * 60 * 1000); 

  const insertPayload = {
    // 1. EL DATO QUE FALTABA: Generamos el ID manualmente
    id: generateUUID(),

    // 2. Relaciones
    cuenta_id: turnData.cuenta_id,
    sucursal_id: turnData.sucursal_id,
    kiosko_id: turnData.kiosko_id,
    cliente_id: turnData.cliente_id,
    categoria_id: turnData.categoria_id,
    
    // 3. Foreign Key obligatoria
    perfil_prioridad_id: DEFAULT_PRIORITY_ID, 

    // 4. Datos del turno
    codigo: turnData.codigo,
    num_sec: Math.floor(Math.random() * 9000) + 1000, 
    estado: 'en_espera',
    naturaleza_base: 'regular',
    es_recuperado: false,
    
    // 5. Fechas y QR
    emitido_en: now.toISOString(),
    emitido_dia: now.toISOString().split('T')[0], 
    tiempo_espera: (turnData.tiempo_espera || 15) * 60, 
    
    qr_hash: `hash_${Math.random().toString(36).substring(7)}_${Date.now()}`, 
    qr_expira_en: expires.toISOString(),
  };

  console.log("Intentando crear turno con payload:", insertPayload);

  const { data, error } = await supabase
    .from('turno')
    .insert([insertPayload])
    .select()
    .single();

  if (error) {
    console.error("Error detallado creando turno:", error);
    throw error;
  }
  return data;
};

export const reactivateTurn = async (turnoId: string) => {
  const { data, error } = await supabase
    .from('turno')
    .update({ 
      estado: 'en_espera', 
      recuperado_en: new Date().toISOString(),
      es_recuperado: true
    })
    .eq('id', turnoId)
    .select()
    .single();

  if (error) {
    console.error("Error reactivando turno:", error);
    throw error;
  }
  return data;
};