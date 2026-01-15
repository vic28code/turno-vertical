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

// En kioskoQueries.ts

export const getTurnoPerdido = async (codigoTurno: string) => {
  const codigo = codigoTurno.toUpperCase().trim();

  // PASO 1: Buscar el turno
  // Agregamos .limit(1) para solucionar el error de duplicados
  const { data: turno, error: errorTurno } = await supabase
    .from('turno')
    .select('id, codigo, estado, cliente_id')
    .eq('codigo', codigo)
    .eq('estado', 'perdido')
    .order('emitido_en', { ascending: false }) // IMPORTANTE: Toma el más reciente
    .limit(1)                                  // IMPORTANTE: Fuerza a traer solo uno y evita el error PGRST116
    .maybeSingle();

  if (errorTurno) {
    console.error("Error buscando turno base:", errorTurno);
    throw errorTurno;
  }
  
  if (!turno) return null;

  // PASO 2: Buscar cliente (igual que antes)
  let clienteData = { nombres: 'Desconocido', apellidos: '', cedula: '' };

  if (turno.cliente_id) {
    const { data: cliente } = await supabase
      .from('cliente')
      .select('nombres, apellidos, cedula')
      .eq('id', turno.cliente_id)
      .maybeSingle();
      
    if (cliente) clienteData = cliente;
  }

  return { ...turno, cliente: clienteData } as TurnoPerdidoDB;
};
// --- QUERIES DE ESCRITURA (CREAR / ACTUALIZAR) ---

export const createTurn = async (turnData: any) => {
  console.log("🛠️ Iniciando creación de turno con datos:", turnData);

  // 1. VALIDACIÓN PREVIA (Evita enviar basura a Supabase)
  if (!turnData.cuenta_id) throw new Error("Falta cuenta_id");
  if (!turnData.sucursal_id) throw new Error("Falta sucursal_id");
  if (!turnData.kiosko_id) throw new Error("Falta kiosko_id");
  if (!turnData.cliente_id) throw new Error("Falta cliente_id");
  
  // 2. GENERAMOS EL ID
  const newId = uuidv4();
  const now = new Date();
  const expires = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // 3. Payload
  const insertPayload = {
    id: newId,
    cuenta_id: turnData.cuenta_id,
    sucursal_id: turnData.sucursal_id,
    kiosko_id: turnData.kiosko_id,
    cliente_id: turnData.cliente_id,
    categoria_id: turnData.categoria_id, // Puede ser null si no seleccionó categoría? Verificar.
    
    perfil_prioridad_id: DEFAULT_PRIORITY_ID, // ⚠️ ASEGÚRATE QUE ESTE ID EXISTA EN TU BD
    codigo: turnData.codigo,
    num_sec: Math.floor(Math.random() * 9000) + 1000,
    estado: 'en_espera',
    naturaleza_base: 'regular',
    es_recuperado: false,
    emitido_en: now.toISOString(),
    emitido_dia: now.toISOString().split('T')[0],
    tiempo_espera: (turnData.tiempo_espera || 15) * 60,
    
    // Generamos un hash único para validación interna
    qr_hash: `hash_${Math.random().toString(36).substring(7)}`, 
    qr_expira_en: expires.toISOString(),
  };

  // 4. INSERCIÓN CON DEBUGGING DETALLADO
  const { data, error } = await supabase
    .from('turno')
    .insert([insertPayload])
    .select()
    .single();

  if (error) {
    // Esto imprimirá el error REAL de la base de datos (ej: Key (xxx) is not present in table yyy)
    console.error("🔥 ERROR CRÍTICO SUPABASE:", JSON.stringify(error, null, 2));
    throw new Error(`Error BD: ${error.message} - Detalles: ${error.details}`);
  }

  console.log("✅ Turno creado exitosamente en BD:", data);
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