import supabase from './supabase';

// --- 1. GENERADOR DE ID MANUAL (Indestructible) ---
// Genera un UUID v4 válido usando crypto del navegador o un fallback matemático
function uuidv4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> (+c / 4)).toString(16)
  );
}

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

  // Corrección de tipos para asegurar compatibilidad
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
  // 1. GENERAMOS EL ID MANUALMENTE
  // Esto es vital porque tu base de datos no tiene autogeneración de UUID
  const newId = uuidv4();
  
  const now = new Date();
  const expires = new Date(now.getTime() + 2 * 60 * 60 * 1000); 

  // 2. Construimos el objeto insertPayload asegurando que 'id' va primero
  const insertPayload = {
    id: newId, // <--- AQUÍ ESTÁ EL FIX: ID EXPLÍCITO

    // Relaciones
    cuenta_id: turnData.cuenta_id,
    sucursal_id: turnData.sucursal_id,
    kiosko_id: turnData.kiosko_id,
    cliente_id: turnData.cliente_id,
    categoria_id: turnData.categoria_id,
    
    // Datos obligatorios y de estado
    perfil_prioridad_id: DEFAULT_PRIORITY_ID, 
    codigo: turnData.codigo,
    num_sec: Math.floor(Math.random() * 9000) + 1000, 
    estado: 'en_espera',
    naturaleza_base: 'regular',
    es_recuperado: false,
    
    // Fechas y Tiempos
    emitido_en: now.toISOString(),
    emitido_dia: now.toISOString().split('T')[0], 
    tiempo_espera: (turnData.tiempo_espera || 15) * 60, 
    
    // Generación simple del hash QR para evitar errores de cálculo
    qr_hash: `hash_${Math.random().toString(36).substring(7)}`, 
    qr_expira_en: expires.toISOString(),
  };

  console.log("🚀 ENVIANDO A SUPABASE CON ID:", insertPayload);

  const { data, error } = await supabase
    .from('turno')
    .insert([insertPayload])
    .select()
    .single();

  if (error) {
    console.error("🔥 Error crítico creando turno:", error);
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