import { useAuth } from './useAuth';

/**
 * Permission structure interface
 */
export interface ModulePermissions {
    view: boolean | 'own' | 'team';
    create: boolean;
    edit: boolean | 'own' | 'team';
    delete: boolean | 'own' | 'team';
    export?: boolean;
}

export interface Permissions {
    users: ModulePermissions;
    leads: ModulePermissions;
    proposals: ModulePermissions;
    tasks: ModulePermissions;
    campaigns: ModulePermissions;
    dashboard: { view: boolean };
    reports: { view: boolean; export: boolean };
}

/**
 * Hook for checking user permissions
 * 
 * Usage:
 * ```tsx
 * const { can, isAdmin, permissions } = usePermissions();
 * 
 * if (can('leads', 'create')) {
 *   // Show create button
 * }
 * 
 * if (isAdmin()) {
 *   // Show admin panel
 * }
 * ```
 */
export function usePermissions() {
    const { user } = useAuth();

    /**
     * Check if user has permission for an action on a resource
     * 
     * @param resource - Resource name (e.g., 'leads', 'users')
     * @param action - Action name (e.g., 'view', 'create', 'edit', 'delete')
     * @param ownerId - Optional owner ID for ownership-based permissions
     * @returns boolean indicating if user has permission
     */
    const can = (
        resource: keyof Permissions,
        action: string,
        ownerId?: number
    ): boolean => {
        if (!user || !user.permissions) {
            return false;
        }

        const permissions = user.permissions;
        const resourcePermissions = permissions[resource];

        if (!resourcePermissions) {
            return false;
        }

        // Check if action exists
        const permission = (resourcePermissions as any)[action];

        if (permission === undefined) {
            return false;
        }

        // Boolean permission
        if (typeof permission === 'boolean') {
            return permission;
        }

        // Ownership-based permission ('own')
        if (permission === 'own') {
            if (ownerId === undefined || ownerId === null) {
                // No owner specified, can't verify ownership
                return false;
            }
            // Check if user is the owner
            return user.id === ownerId;
        }

        // Team-based permission ('team') - future implementation
        if (permission === 'team') {
            // TODO: Implement team-based permission checks
            return false;
        }

        return false;
    };

    /**
     * Check if current user is admin
     */
    const isAdmin = (): boolean => {
        return user?.role?.toLowerCase() === 'admin';
    };

    /**
     * Get all permissions for current user
     */
    const getPermissions = (): Permissions | null => {
        return user?.permissions || null;
    };

    /**
     * Check if user can perform action on ANY resource
     * Useful for showing/hiding entire sections
     */
    const canAny = (resource: keyof Permissions): boolean => {
        if (!user || !user.permissions) {
            return false;
        }

        const resourcePermissions = user.permissions[resource];
        if (!resourcePermissions) {
            return false;
        }

        // Check if user has ANY permission on this resource
        return Object.values(resourcePermissions).some(perm => perm === true || perm === 'own' || perm === 'team');
    };

    return {
        can,
        isAdmin,
        permissions: getPermissions(),
        canAny
    };
}
