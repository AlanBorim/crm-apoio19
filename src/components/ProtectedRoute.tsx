import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    resource: string;
    action?: string;
    fallback?: React.ReactNode;
    redirectTo?: string;
}

/**
 * Component to protect routes based on user permissions
 * 
 * Usage:
 * ```tsx
 * <ProtectedRoute resource="usuarios" action="view">
 *   <UserManagement />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
    children,
    resource,
    action = 'view',
    fallback,
    redirectTo = '/'
}: ProtectedRouteProps) {
    const { can } = usePermissions();

    if (!can(resource, action)) {
        if (fallback) {
            return <>{fallback}</>;
        }

        if (redirectTo) {
            return <Navigate to={redirectTo} replace />;
        }

        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-center text-gray-900">
                        Acesso Negado
                    </h3>
                    <p className="mt-2 text-sm text-center text-gray-600">
                        Você não tem permissão para acessar esta página.
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => window.history.back()}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
