import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { AccessDenied } from './AccessDenied';

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
    redirectTo
}: ProtectedRouteProps) {
    const { can } = usePermissions();

    if (!can(resource, action)) {
        if (fallback) {
            return <>{fallback}</>;
        }

        if (redirectTo) {
            return <Navigate to={redirectTo} replace />;
        }

        return <AccessDenied />;
    }

    return <>{children}</>;
}
