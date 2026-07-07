// Em dev, string vazia → o proxy do Vite resolve para localhost:3000
// Em produção, aponta para o backend no Railway (via VITE_API_URL)
export const API_BASE = import.meta.env.VITE_API_URL ?? ''
