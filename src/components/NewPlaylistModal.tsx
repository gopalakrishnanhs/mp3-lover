import React, { useState } from 'react';
import { X, Plus, ListMusic } from 'lucide-react';

interface NewPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export const NewPlaylistModal: React.FC<NewPlaylistModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim());
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">New Playlist</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Playlist Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g., Favorites, Late Night Drives, Focus Work..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              placeholder="Add an optional description for this collection..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400/50 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-md shadow-sky-500/20"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
