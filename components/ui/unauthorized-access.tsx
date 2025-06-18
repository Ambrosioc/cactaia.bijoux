import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

interface UnauthorizedAccessProps {
  title?: string;
  message?: string;
  redirectTo?: string;
  redirectLabel?: string;
}

export function UnauthorizedAccess({
  title = 'Accès non autorisé',
  message = 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.',
  redirectTo = '/compte',
  redirectLabel = 'Retour au compte'
}: UnauthorizedAccessProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      
      <h1 className="text-2xl font-semibold mb-4">{title}</h1>
      <p className="text-muted-foreground mb-8 max-w-md">{message}</p>
      
      <Link 
        href={redirectTo}
        className="btn btn-primary px-6 py-2"
      >
        {redirectLabel}
      </Link>
    </div>
  );
}