import type React from 'react';
import type { Scene } from '../schema/types';

/**
 * Escape hatch for the rare scene that genuinely cannot be expressed as data.
 * Register a component here and reference it from scenes.json with
 * `"component": "MyScene"`. It renders inside the normal scene context
 * (useScene(), transitions, audio) — prefer extending the schema first.
 */
export type CustomSceneComponent = React.FC<{ scene: Scene }>;

export const CUSTOM_SCENES: Record<string, CustomSceneComponent> = {};
