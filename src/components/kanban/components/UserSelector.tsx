import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types/kanban';
import { ChevronDown, X, Search, Check } from 'lucide-react';

interface UserSelectorProps {
  users: User[];
  selectedUsers: User[];
  onSelectionChange: (users: User[]) => void;
  placeholder?: string;
  maxSelections?: number;
  disabled?: boolean;
  className?: string;
}

export function UserSelector({
  users,
  selectedUsers,
  onSelectionChange,
  placeholder = "Selecionar usuários...",
  maxSelections,
  disabled = false,
  className = ""
}: UserSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableUsers = filteredUsers.filter(user =>
    !selectedUsers.some(selected => selected.id === user.id)
  );

  const handleUserToggle = (user: User) => {
    const isSelected = selectedUsers.some(selected => selected.id === user.id);

    if (isSelected) {
      // Remove user
      onSelectionChange(selectedUsers.filter(selected => selected.id !== user.id));
    } else {
      // Add user (check max limit)
      if (!maxSelections || selectedUsers.length < maxSelections) {
        onSelectionChange([...selectedUsers, user]);
      }
    }
  };

  const handleRemoveUser = (userId: string) => {
    onSelectionChange(selectedUsers.filter(user => user.id !== userId));
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'gerente':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'usuario':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';
    }
  };

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'gerente':
        return 'Gerente';
      case 'usuario':
        return 'Usuário';
      default:
        return role;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Users Display */}
      <div
        className={`min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent dark:bg-slate-800 dark:border-slate-700 ${disabled ? 'bg-gray-50 cursor-not-allowed dark:bg-slate-900' : ''
          }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap items-center gap-1">
          {selectedUsers.length === 0 ? (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          ) : (
            selectedUsers.map((user) => (
              <div
                key={user.id}
                className="inline-flex items-center space-x-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm dark:bg-orange-900/30 dark:text-orange-300"
              >
                <div className="w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {getUserInitials(user.nome)}
                  </span>
                </div>
                <span>{user.nome}</span>
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveUser(user.id);
                    }}
                    className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))
          )}

          {!disabled && (
            <div className="flex-1 flex justify-end">
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-slate-700">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuários..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-600 dark:text-gray-100 dark:placeholder-gray-500"
                autoFocus
              />
            </div>
          </div>

          {/* Users List */}
          <div className="max-h-48 overflow-y-auto">
            {availableUsers.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                {searchTerm ? 'Nenhum usuário encontrado' : 'Todos os usuários já foram selecionados'}
              </div>
            ) : (
              availableUsers.map((user) => {
                const isSelected = selectedUsers.some(selected => selected.id === user.id);
                const canSelect = !maxSelections || selectedUsers.length < maxSelections || isSelected;

                return (
                  <div
                    key={user.id}
                    onClick={() => canSelect && handleUserToggle(user)}
                    className={`flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer dark:hover:bg-slate-700 ${!canSelect ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-orange-600">
                        {getUserInitials(user.nome)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">
                          {user.nome}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getUserRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>

                    {isSelected && (
                      <Check size={16} className="text-orange-600" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {maxSelections && (
            <div className="p-2 border-t border-gray-200 bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
              <p className="text-xs text-gray-500 text-center dark:text-gray-400">
                {selectedUsers.length} de {maxSelections} usuários selecionados
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
