/**
 * SecondQuest engine design tokens (UI overlays, text, placeholders).
 * Illustrations carry the visual identity; these only style engine-drawn
 * elements, so they are deliberately restrained and easy to retune.
 */
export const theme = {
  color: {
    ink: '#16161f',
    paper: '#fff8ec',
    white: '#ffffff',
    questRed: '#d6392f',
    gold: '#ffc83d',
    green: '#35c26b',
    danger: '#ea4b4b',
    uiPanel: 'rgba(14, 16, 26, 0.78)',
    uiBorder: 'rgba(255, 255, 255, 0.22)',
  },
  font: {
    display: "'Anton', 'Impact', sans-serif",
    ui: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  },
  /** Outline + shadow shared by punch text so it reads on any artwork. */
  textStroke: (px: number, color = '#16161f') => ({
    WebkitTextStroke: `${px}px ${color}`,
    paintOrder: 'stroke fill' as const,
  }),
  shadow: '0 10px 30px rgba(0,0,0,0.35)',
} as const;
