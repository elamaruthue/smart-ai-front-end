import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

/** Container that staggers its children as they enter */
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

/** Each child fades + slides up */
export const cardItemVariants: Variants = {
  hidden:  { opacity: 0, y: 22, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
};

interface ContainerProps { children: ReactNode; className?: string }

/** Wrap a list of AnimatedCardItem children to get a stagger entrance */
export function AnimatedCardList({ children, className }: ContainerProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      style={{ display: 'contents' }}
    >
      {children}
    </motion.div>
  );
}

interface ItemProps { children: ReactNode; style?: React.CSSProperties }

/** Individual animated card item */
export function AnimatedCardItem({ children, style }: ItemProps) {
  return (
    <motion.div variants={cardItemVariants} style={style}>
      {children}
    </motion.div>
  );
}

/** Simple fade-in for stat/info boxes */
export function FadeIn({
  children,
  delay = 0,
  style,
}: { children: ReactNode; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
