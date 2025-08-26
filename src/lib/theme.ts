export type Dept = 'math'|'explore'|'research';

export const deptAccent = (d: Dept) => ({
  math: 'ring-[--accent-math] shadow-[0_0_20px_rgba(255,122,89,0.25)]',
  explore: 'ring-[--accent-explore] shadow-[0_0_20px_rgba(138,92,255,0.25)]',
  research: 'ring-[--accent-research] shadow-[0_0_20px_rgba(20,184,166,0.25)]',
}[d]);

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
