import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, Tag, AlertCircle, MessageSquare, Paperclip } from 'lucide-react';
import { KanbanCard, User as UserType, Comment, KanbanPriority } from '../types/kanban';
import { UserSelector } from './UserSelector';

interface CardEditModalProps {
  card: KanbanCard;
  users: UserType[];
  currentUser: UserType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: Partial<KanbanCard>) => void;
  onAddComment: (content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export function CardEditModal({
  card,
  users,
  currentUser,
  isOpen,
  onClose,
  onSave,
  onAddComment,
  onUpdateComment,
  onDeleteComment
}: CardEditModalProps) {
  const [formData, setFormData] = useState({
    title: card.title,
    description: card.description,
    priority: card.priority,
    dueDate: card.dueDate || '',
    assignedTo: card.assignedTo || [],
    tags: card.tags?.join(', ') || ''
  });

  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: card.title,
        description: card.description,
        priority: card.priority,
        dueDate: card.dueDate || '',
        assignedTo: card.assignedTo || [],
        tags: card.tags?.join(', ') || ''
      });
    }
  }, [card, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedCard: Partial<KanbanCard> = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      assignedTo: formData.assignedTo,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    };
    onSave(updatedCard);
    onClose();
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleSaveComment = (commentId: string) => {
    if (editCommentContent.trim()) {
      onUpdateComment(commentId, editCommentContent.trim());
      setEditingComment(null);
      setEditCommentContent('');
    }
  };

  const handleCancelEditComment = () => {
    setEditingComment(null);
    setEditCommentContent('');
  };

  const getPriorityColor = (priority: KanbanPriority) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = () => {
    if (!card.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(card.dueDate);
    return dueDate < today;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Editar Card</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex">
            {/* Main Content */}
            <div className="flex-1 p-6">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Digite o título do card"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Digite a descrição do card"
                  />
                </div>

                {/* Priority and Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <AlertCircle size={16} className="inline mr-1" />
                      Prioridade
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as KanbanPriority })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-1" />
                      Data de Vencimento
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        isOverdue() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {isOverdue() && (
                      <p className="text-xs text-red-600 mt-1">Esta tarefa está atrasada</p>
                    )}
                  </div>
                </div>

                {/* Assigned Users */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-1" />
                    Responsáveis
                  </label>
                  <UserSelector
                    users={users}
                    selectedUsers={formData.assignedTo}
                    onSelectionChange={(users) => setFormData({ ...formData, assignedTo: users })}
                    placeholder="Selecionar responsáveis..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag size={16} className="inline mr-1" />
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar - Comments */}
            <div className="w-80 border-l border-gray-200 bg-gray-50">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  <MessageSquare size={16} className="inline mr-2" />
                  Comentários ({card.comments?.length || 0})
                </h3>

                {/* Add Comment */}
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar comentário..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="mt-2 w-full px-3 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Adicionar Comentário
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {card.comments?.map((comment) => (
                    <div key={comment.id} className="bg-white p-3 rounded-md shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-orange-600">
                              {comment.user.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-900">
                            {comment.user.nome}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {editingComment === comment.id ? (
                        <div>
                          <textarea
                            value={editCommentContent}
                            onChange={(e) => setEditCommentContent(e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => handleSaveComment(comment.id)}
                              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={handleCancelEditComment}
                              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                          {(currentUser.id === comment.userId || currentUser.role === 'admin') && (
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => handleEditComment(comment)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => onDeleteComment(comment.id)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Criado por {card.createdBy.nome}</span>
              <span>em {new Date(card.createdAt).toLocaleDateString('pt-BR')}</span>
              {card.updatedAt !== card.createdAt && (
                <span>• Atualizado em {new Date(card.updatedAt).toLocaleDateString('pt-BR')}</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors flex items-center"
              >
                <Save size={16} className="mr-2" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
