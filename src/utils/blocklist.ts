// Aeronaves que não devem aparecer no mapa, no histórico nem no PDF.
// Match por matrícula/callsign, ignorando maiúsculas, espaços e hífens
// (ex.: "PRPUB", "PR-PUB", "pr pub" são todos bloqueados).
const BLOCKED_CALLSIGNS = ['PRPUB']

function normalize(value: string | null | undefined): string {
  return (value ?? '').toUpperCase().replace(/[\s-]/g, '')
}

/** Retorna true se o callsign/matrícula pertence a uma aeronave bloqueada. */
export function isBlockedCallsign(callsign: string | null | undefined): boolean {
  const normalized = normalize(callsign)
  if (!normalized) return false
  return BLOCKED_CALLSIGNS.some(blocked => normalized.includes(blocked))
}
