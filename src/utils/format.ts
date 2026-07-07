export function fmt(val: number | null, unit: string): string {
  return val != null ? `${val} ${unit}` : '—'
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function applyRotation(el: HTMLElement, deg: number, animate: boolean): void {
  const target = el.querySelector('.ac-body') as HTMLElement | null
  if (!target) return
  target.style.transformOrigin = 'center'
  target.style.transition      = animate ? 'transform 2s linear' : 'none'
  target.style.transform       = `rotate(${deg}deg)`
}
