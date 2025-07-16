'use client';

import { initializeServiceWorker } from '@/lib/service-worker';
import { useEffect } from 'react';

export default function ServiceWorkerInitializer() {
    useEffect(() => {
        // Initialiser le service worker
        initializeServiceWorker();
    }, []);

    return null;
} 