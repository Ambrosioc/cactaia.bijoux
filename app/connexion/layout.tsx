"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function ConnexionLayout({ children }: { children: React.ReactNode }) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={typeof window !== 'undefined' ? window.location.pathname : 'connexion'}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                style={{ minHeight: '100vh' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
} 