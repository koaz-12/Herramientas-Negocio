import { createClient } from '@supabase/supabase-js';

// En un entorno de producción, estos valores deberían venir de variables de entorno (.env)
// Sin embargo, como el usuario introducirá sus credenciales de otras BDD en Settings 
// (para herramientas de importación), mantendremos este cliente principal estático para esta App.

// NOTA: Para no forzar la creación de un .env inmediatamente para la App misma, 
// permitiremos inicializarlo con valores fijos si existen o desde variables Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://efyvyjqrldvwvtnpnenz.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmeXZ5anFybGR2d3Z0bnBuZW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTQzOTQsImV4cCI6MjA4MTIzMDM5NH0.1t8sNSLCGOrla3l-EQY0zHBdqorCRebGVv-Ii1eDqw8';

export const supabase = createClient(supabaseUrl, supabaseKey);
