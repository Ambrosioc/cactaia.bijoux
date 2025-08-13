import React from 'react';

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="pt-24">
            {children}
        </div>
    );
}


