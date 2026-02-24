// ==============================
// utils.ts — Funções utilitárias globais
// Contém a função cn() para mesclagem inteligente de classes CSS do Tailwind
// ==============================

import { clsx, type ClassValue } from "clsx";       // clsx: concatena classes condicionalmente (suporta strings, objetos, arrays)
import { twMerge } from "tailwind-merge";            // twMerge: resolve conflitos de classes Tailwind (ex: "p-2 p-4" → "p-4")

/**
 * cn() — Combina e mescla classes CSS do Tailwind de forma inteligente
 * 
 * Fluxo interno:
 * 1. clsx() concatena todas as classes (ignorando valores falsy como undefined, false, null)
 * 2. twMerge() resolve conflitos — se duas classes do Tailwind se contradizem, a última vence
 * 
 * Exemplo de uso:
 *   cn("bg-red-500", isActive && "bg-blue-500", "p-4")
 *   → Se isActive=true: "bg-blue-500 p-4" (twMerge remove bg-red-500 pois conflita)
 *   → Se isActive=false: "bg-red-500 p-4" (clsx ignora o false)
 * 
 * @param inputs - Lista de valores de classe CSS (strings, objetos, arrays, condicionais)
 * @returns String final de classes CSS mescladas sem conflitos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}