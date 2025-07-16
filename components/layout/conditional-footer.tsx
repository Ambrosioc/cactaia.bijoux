'use client';

import { usePathname } from 'next/navigation';
import Footer from './footer';

const ConditionalFooter = () => {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');

    if (isAdminPage) {
        return null;
    }

    return <Footer />;
};

export default ConditionalFooter; 