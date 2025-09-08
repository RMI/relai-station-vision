import { motion } from 'framer-motion';

// Motion design tokens and reusable variants
export const motionTimings = {
  quick: 0.12,
  fast: 0.18,
  base: 0.24,
  slow: 0.4
};

export const ease = {
  standard: [0.16, 1, 0.3, 1],
  emphasized: [0.4, 0, 0.2, 1]
};

export const variants = {
  fadeInUp: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.3 } }
  },
  scaleCard: {
    hidden: { opacity: 0, y: 14, scale: 0.98 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: 0.15 + i * 0.05,
        duration: 0.5,
        ease: [0.16,1,0.3,1]
      }
    }),
    exit: { opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.25 } }
  },
  staggerHero: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  },
  fadeItem: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16,1,0.3,1] } }
  }
};

export const springLayout = { type: 'spring', stiffness: 300, damping: 30, mass: 0.9 };
export const listStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } }
};

export default { motionTimings, ease, variants, springLayout, listStagger };