import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { KanbanColumn } from '../types/kanban';
import { Trash2, Palette } from 'lucide-react';

interface ColumnSettingsModalProps {
  isOpen: boolean;
  column: KanbanColumn;
  onClose: () => void;
  onSave: (updates: Partial<KanbanColumn>) => void;
  onDelete: () => Promise<void> | void;
}

export function ColumnSettingsModal({ isOpen, column, onClose, onSave, onDelete }: ColumnSettingsModalProps) {
  const [title, setTitle] = useState(column.title);
  const [color, setColor] = useState<string>(column.color || '');

  const presetColors = useMemo(() => [
    { name: 'Cinza', value: 'gray' },
    { name: 'Azul', value: 'blue' },
    { name: 'Verde', value: 'green' },
    { name: 'Amarelo', value: 'yellow' },
    { name: 'Vermelho', value: 'red' },
    { name: 'Roxo', value: 'purple' },
    { name: 'Rosa', value: 'pink' },
    { name: 'Laranja', value: 'orange' },
  ], []);

  const colorHexMap: Record<string, string> = {
    gray: '#9CA3AF',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    red: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
    orange: '#F97316',
  };

  const handleSave = () => {
    const updates: Partial<KanbanColumn> = { title, color: color || undefined };
    onSave(updates);
    onClose();
  };

  const handleDelete = async () => {
    if (column.cards.length > 0) {
      const confirmDelete = window.confirm(`A coluna "${column.title}" possui ${column.cards.length} card(s). Deseja excluir a coluna e remover todos os cards do banco?`);
      if (!confirmDelete) return;
    } else {
      const confirmDelete = window.confirm(`Deseja excluir a coluna "${column.title}"?`);
      if (!confirmDelete) return;
    }

    await onDelete();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações da Coluna</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da coluna</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome da coluna" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
            <div className="flex items-center gap-2 mb-2">
              <Palette size={16} className="text-gray-500" />
              <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Ex.: blue, orange ou #FF6B00" />
            </div>
            <div className="grid grid-cols-8 gap-2">
              {presetColors.map((c) => {
                const base = colorHexMap[c.value] || '#9CA3AF';
                return (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: `${base}33`, borderColor: base }}
                    title={c.name}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 size={16} className="mr-2" />
            Excluir Coluna
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}