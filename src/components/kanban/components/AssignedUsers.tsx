import React, { useState } from 'react';
import { User } from '../types/kanban';
import { Users, Crown, Shield, User as UserIcon, Mail, MoreHorizontal } from 'lucide-react';

interface AssignedUsersProps {
  users: User[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  showRoles?: boolean;
  className?: string;
  onUserClick?: (user: User) => void;
}

export function AssignedUsers({
  users,
  maxDisplay = 3,
  size = 'md',
  showDetails = false,
  showRoles = false,
  className = '',
  onUserClick
}: AssignedUsersProps) {
  const [showAllUsers, setShowAllUsers] = useState(false);

  if (!users || users.length === 0) {
    return (
      <div className={`flex items-center text-gray-400 ${className}`}>
        <Users size={16} className="mr-1" />
        <span className="text-sm">Não atribuído</span>
      </div>
    );
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <Crown size={12} className="text-red-600" />;
      case 'gerente':
        return <Shield size={12} className="text-blue-600" />;
      case 'usuario':
        return <UserIcon size={12} className="text-green-600" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'border-red-200 bg-red-50';
      case 'gerente':
        return 'border-blue-200 bg-blue-50';
      case 'usuario':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          avatar: 'w-6 h-6',
          text: 'text-xs',
          spacing: 'space-x-1'
        };
      case 'lg':
        return {
          avatar: 'w-10 h-10',
          text: 'text-base',
          spacing: 'space-x-3'
        };
      default:
        return {
          avatar: 'w-8 h-8',
          text: 'text-sm',
          spacing: 'space-x-2'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const displayUsers = showAllUsers ? users : users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  if (showDetails) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <Users size={16} className="mr-2" />
            Responsáveis ({users.length})
          </h4>
          {users.length > maxDisplay && (
            <button
              onClick={() => setShowAllUsers(!showAllUsers)}
              className="text-xs text-orange-600 hover:text-orange-800"
            >
              {showAllUsers ? 'Mostrar menos' : `Ver todos (${remainingCount} mais)`}
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {displayUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => onUserClick?.(user)}
              className={`flex items-center ${sizeClasses.spacing} p-2 rounded-lg border ${getRoleColor(user.role)} ${
                onUserClick ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''
              }`}
            >
              <div className={`${sizeClasses.avatar} bg-orange-100 rounded-full flex items-center justify-center relative`}>
                <span className={`font-medium text-orange-600 ${sizeClasses.text}`}>
                  {getUserInitials(user.nome)}
                </span>
                {showRoles && (
                  <div className="absolute -top-1 -right-1">
                    {getRoleIcon(user.role)}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-gray-900 truncate ${sizeClasses.text}`}>
                  {user.nome}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500 truncate flex items-center">
                    <Mail size={10} className="mr-1" />
                    {user.email}
                  </p>
                  {showRoles && (
                    <span className="text-xs text-gray-400 capitalize">
                      {user.role}
                    </span>
                  )}
                </div>
              </div>
              
              {onUserClick && (
                <MoreHorizontal size={16} className="text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Compact display (default)
  return (
    <div className={`flex items-center ${sizeClasses.spacing} ${className}`}>
      <div className="flex -space-x-1">
        {displayUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => onUserClick?.(user)}
            className={`${sizeClasses.avatar} bg-orange-100 rounded-full flex items-center justify-center border-2 border-white relative ${
              onUserClick ? 'cursor-pointer hover:z-10 hover:scale-110 transition-transform' : ''
            }`}
            title={`${user.nome} (${user.role})`}
          >
            <span className={`font-medium text-orange-600 ${sizeClasses.text}`}>
              {getUserInitials(user.nome)}
            </span>
            {showRoles && (
              <div className="absolute -top-1 -right-1">
                {getRoleIcon(user.role)}
              </div>
            )}
          </div>
        ))}
        
        {remainingCount > 0 && !showAllUsers && (
          <div
            className={`${sizeClasses.avatar} bg-gray-100 rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-gray-200 transition-colors`}
            onClick={() => setShowAllUsers(true)}
            title={`${remainingCount} usuário(s) a mais`}
          >
            <span className={`font-medium text-gray-600 ${sizeClasses.text}`}>
              +{remainingCount}
            </span>
          </div>
        )}
      </div>
      
      {size !== 'sm' && (
        <span className={`text-gray-500 ${sizeClasses.text}`}>
          {users.length} {users.length === 1 ? 'responsável' : 'responsáveis'}
        </span>
      )}
    </div>
  );
}
