import React from 'react'
import { Composition } from 'remotion'
import { SalesModuleVideo, FPS, PAD_S, type ModuleProps } from './scenes'

/**
 * Remotion root — one parameterized composition. The generator script passes
 * the module spec (scenes + per-scene audio durations) via --props; duration
 * is computed from the scene durations.
 */
const FALLBACK: ModuleProps = {
  number: 0,
  title: 'Preview',
  scenes: [
    { type: 'title', dur: 4, props: { title: 'Preview', subtitle: 'Pass real props via --props' } },
  ],
}

export const Root: React.FC = () => (
  <Composition
    id="SalesModule"
    component={SalesModuleVideo}
    fps={FPS}
    width={1280}
    height={720}
    durationInFrames={300}
    defaultProps={FALLBACK}
    calculateMetadata={({ props }) => {
      const total = (props as ModuleProps).scenes.reduce((s, sc) => s + sc.dur + PAD_S, 0)
      return { durationInFrames: Math.max(60, Math.round(total * FPS)) }
    }}
  />
)
