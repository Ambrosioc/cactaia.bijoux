'use client';

import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />;
        }

        return this.props.children;
    }
}

interface ErrorFallbackProps {
    error?: Error;
    errorInfo?: ErrorInfo;
}

function ErrorFallback({ error, errorInfo }: ErrorFallbackProps) {
    const handleReload = () => {
        window.location.reload();
    };

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {/* Icône d'erreur */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>

                {/* Titre */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Oups ! Une erreur s'est produite
                </h1>

                {/* Message */}
                <p className="text-gray-600 mb-6">
                    Nous sommes désolés, quelque chose s'est mal passé lors du chargement de cette page.
                </p>

                {/* Détails techniques (en mode développement) */}
                {process.env.NODE_ENV === 'development' && error && (
                    <details className="text-left mb-6 p-4 bg-gray-50 rounded-lg">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                            Détails techniques
                        </summary>
                        <div className="text-xs text-gray-600 space-y-2">
                            <div>
                                <strong>Erreur:</strong> {error.message}
                            </div>
                            {errorInfo && (
                                <div>
                                    <strong>Stack:</strong>
                                    <pre className="mt-1 text-xs overflow-auto">
                                        {errorInfo.componentStack}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </details>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleReload}
                        className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Recharger la page
                    </button>

                    <button
                        onClick={handleGoBack}
                        className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour en arrière
                    </button>

                    <Link
                        href="/admin"
                        className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Retour au dashboard
                    </Link>
                </div>

                {/* Message de support */}
                <p className="text-xs text-gray-500 mt-6">
                    Si le problème persiste, contactez notre équipe de support.
                </p>
            </div>
        </div>
    );
}

// Hook pour gérer les erreurs dans les composants fonctionnels
export function useErrorHandler() {
    const handleError = (error: Error, context?: string) => {
        console.error(`Error in ${context || 'component'}:`, error);

        // Ici vous pourriez envoyer l'erreur à un service de monitoring
        // comme Sentry, LogRocket, etc.

        // Optionnel : afficher une notification d'erreur
        if (typeof window !== 'undefined') {
            // Vous pouvez intégrer avec votre système de notifications
            console.warn('Consider showing a user-friendly error notification');
        }
    };

    const handleAsyncError = (error: unknown, context?: string) => {
        if (error instanceof Error) {
            handleError(error, context);
        } else {
            console.error(`Unknown error in ${context || 'component'}:`, error);
        }
    };

    return { handleError, handleAsyncError };
}

// Composant de gestion d'erreur pour les composants spécifiques
export function PaymentErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">
                Erreur de chargement des paiements
            </h3>
            <p className="text-red-600 mb-4">
                {error.message || 'Impossible de charger les données des paiements'}
            </p>
            <button
                onClick={retry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
                <RefreshCw className="h-4 w-4 mr-2 inline" />
                Réessayer
            </button>
        </div>
    );
}
