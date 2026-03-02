// ==============================
// supabase/client.ts — Cliente Supabase para acesso direto ao banco
//
// ATENÇÃO: Este arquivo foi gerado automaticamente pela integração Supabase.
// Não edite manualmente.
//
// Uso: import { supabase } from "@/integrations/supabase/client";
//
// Este cliente é usado em RelatoriosPage.tsx para consultar diretamente
// as tabelas compras_animais e compras_insumos via SDK do Supabase.
// As demais páginas usam a API REST própria (http://localhost:3001).
//
// As variáveis de ambiente devem ser definidas no arquivo .env:
//   VITE_SUPABASE_URL             → URL do projeto Supabase
//   VITE_SUPABASE_PUBLISHABLE_KEY → chave anon/public (segura para o browser)
// ==============================
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,   // persiste a sessão no localStorage do navegador
    persistSession: true,    // mantém o usuário logado entre reloads de página
    autoRefreshToken: true,  // renova o token JWT automaticamente antes de expirar
  }
});