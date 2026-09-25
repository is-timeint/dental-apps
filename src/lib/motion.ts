// Motion Constants per STD-DES-001 (design-standards.md)
export const MOTION_CONSTANTS = {
  springStandard: {
    type: 'spring',
    stiffness: 350,
    damping: 32,
    mass: 0.8,
  },
  springSnappy: {
    type: 'spring',
    stiffness: 460,
    damping: 28,
    mass: 0.5,
  },
  springTactile: {
    type: 'spring',
    stiffness: 520,
    damping: 24,
    mass: 0.4,
  },
  springBouncy: {
    type: 'spring',
    stiffness: 280,
    damping: 18,
    mass: 1.0,
  },
} as const;

export const DAMPED_SPRINGS = {
  tactile: MOTION_CONSTANTS.springTactile,
  gentle: MOTION_CONSTANTS.springStandard,
  snappy: MOTION_CONSTANTS.springSnappy,
  bouncy: MOTION_CONSTANTS.springBouncy,
} as const;

// Direction-aware tab transition variants
export const tabSlideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 32 : -32,
    opacity: 0,
    scale: 0.99,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -32 : 32,
    opacity: 0,
    scale: 0.99,
  }),
};
