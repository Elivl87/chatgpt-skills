/** A composable 2-D transform delta produced by animations. */
export interface Transform {
  /** px offsets (1080p reference). */
  x: number;
  y: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  /** degrees */
  rotate: number;
  opacity: number;
  /** px blur */
  blur: number;
  /** 0..1 horizontal reveal (wipe). 1 = fully visible. */
  reveal: number;
}

export const IDENTITY: Transform = {
  x: 0,
  y: 0,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  opacity: 1,
  blur: 0,
  reveal: 1,
};

export const combine = (a: Transform, b: Partial<Transform>): Transform => ({
  x: a.x + (b.x ?? 0),
  y: a.y + (b.y ?? 0),
  scale: a.scale * (b.scale ?? 1),
  scaleX: a.scaleX * (b.scaleX ?? 1),
  scaleY: a.scaleY * (b.scaleY ?? 1),
  rotate: a.rotate + (b.rotate ?? 0),
  opacity: a.opacity * (b.opacity ?? 1),
  blur: a.blur + (b.blur ?? 0),
  reveal: Math.min(a.reveal, b.reveal ?? 1),
});

export const toCss = (t: Transform): React.CSSProperties => ({
  transform:
    `translate(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px) rotate(${t.rotate.toFixed(3)}deg) ` +
    `scale(${(t.scale * t.scaleX).toFixed(4)}, ${(t.scale * t.scaleY).toFixed(4)})`,
  opacity: Math.max(0, Math.min(1, t.opacity)),
  filter: t.blur > 0.05 ? `blur(${t.blur.toFixed(2)}px)` : undefined,
  clipPath: t.reveal < 0.999 ? `inset(-50% ${((1 - t.reveal) * 100).toFixed(2)}% -50% -50%)` : undefined,
});
