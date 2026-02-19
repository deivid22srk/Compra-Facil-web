
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zlykhkpycrsukoaxhfzn.supabase.co';
const supabaseKey = 'sb_publishable_F9BmcR4Fv39SK1Kiz3yKFQ_75DYBudY';

// Configuração otimizada para evitar erros de LockManager (tela branca ou timeout)
// em ambientes de visualização ou navegadores com restrições de segurança.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Define explicitamente o armazenamento para evitar que o LockManager 
    // do navegador cause timeouts em operações concorrentes.
    storage: window.localStorage,
    storageKey: 'comprafacil-riacho-auth-token'
  }
});
