'use client';

import { useUser } from '@/stores/userStore';
import { Settings, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RoleSwitcherProps {
  variant?: 'button' | 'badge' | 'dropdown';
  className?: string;
  showLabel?: boolean;
}

export function RoleSwitcher({ 
  variant = 'button', 
  className,
  showLabel = true 
}: RoleSwitcherProps) {
  const { 
    user, 
    canSwitchToAdmin, 
    isActiveAdmin, 
    isActiveUser, 
    switchRole, 
    currentModeLabel,
    loading 
  } = useUser();
  
  const [switching, setSwitching] = useState(false);

  if (!user || !canSwitchToAdmin) {
    // Afficher juste le badge pour les utilisateurs normaux
    if (variant === 'badge' && user) {
      return (
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs",
          isActiveAdmin 
            ? "bg-red-100 text-red-700" 
            : "bg-blue-100 text-blue-700",
          className
        )}>
          {isActiveAdmin ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
          {showLabel && currentModeLabel}
        </span>
      );
    }
    return null;
  }

  const handleSwitch = async () => {
    if (switching || loading) return;
    
    setSwitching(true);
    try {
      const targetRole = isActiveAdmin ? 'user' : 'admin';
      await switchRole(targetRole);
      
      // Redirection après changement de rôle
      if (targetRole === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/compte';
      }
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
    } finally {
      setSwitching(false);
    }
  };

  if (variant === 'badge') {
    return (
      <button
        onClick={handleSwitch}
        disabled={switching || loading}
        className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs transition-colors",
          isActiveAdmin 
            ? "bg-red-100 text-red-700 hover:bg-red-200" 
            : "bg-blue-100 text-blue-700 hover:bg-blue-200",
          switching && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {isActiveAdmin ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
        {showLabel && (switching ? 'Changement...' : currentModeLabel)}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleSwitch}
        disabled={switching || loading}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActiveAdmin
            ? "bg-red-50 text-red-700 hover:bg-red-100"
            : "bg-blue-50 text-blue-700 hover:bg-blue-100",
          switching && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <Settings className="h-4 w-4" />
        {switching 
          ? 'Changement...' 
          : `Passer en mode ${isActiveAdmin ? 'Client' : 'Admin'}`
        }
      </button>
    );
  }

  return null;
}