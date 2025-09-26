import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface EditableTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
  canEdit: boolean;
  className?: string;
  placeholder?: string;
}

export function EditableTitle({ 
  title, 
  onSave, 
  canEdit, 
  className = '', 
  placeholder = 'Digite o título...' 
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  const handleStartEdit = () => {
    if (canEdit) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (editValue.trim() && editValue !== title) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="flex-1 px-2 py-1 text-sm border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder={placeholder}
        />
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:text-green-800 transition-colors"
          title="Salvar"
        >
          <Check size={14} />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-red-600 hover:text-red-800 transition-colors"
          title="Cancelar"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`group flex items-center space-x-2 ${canEdit ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleStartEdit}
    >
      <span className="flex-1">{title}</span>
      {canEdit && (
        <Edit2 
          size={14} 
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-orange-500 transition-all duration-200" 
        />
      )}
    </div>
  );
}
