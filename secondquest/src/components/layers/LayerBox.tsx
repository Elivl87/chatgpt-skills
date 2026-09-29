import React from 'react';
import { toCss, type Transform } from '../../animations/transform';

/**
 * Positions a box by its anchor point in frame pixels and applies an animation
 * transform around that anchor (so characters squash from their feet, etc.).
 */
export const LayerBox: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  anchor: [number, number];
  transform: Transform;
  rotation?: number;
  opacity?: number;
  flip?: boolean;
  blend?: string;
  children: React.ReactNode;
}> = ({ x, y, w, h, anchor, transform, rotation = 0, opacity = 1, flip, blend, children }) => {
  const css = toCss({ ...transform, rotate: transform.rotate + rotation, opacity: transform.opacity * opacity });
  if (flip) css.transform = `${css.transform} scaleX(-1)`;
  if (css.opacity === 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - anchor[0] * w,
        top: y - anchor[1] * h,
        width: w,
        height: h,
        transformOrigin: `${anchor[0] * 100}% ${anchor[1] * 100}%`,
        mixBlendMode: blend as React.CSSProperties['mixBlendMode'],
        ...css,
      }}
    >
      {children}
    </div>
  );
};
