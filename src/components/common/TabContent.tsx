import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface TabContentProps {
    children: ReactNode;
    id: string; // Key for AnimatePresence to track changes
    className?: string;
}

const variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

export function TabContent({ children, id, className }: TabContentProps) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={id}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.2 }}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
