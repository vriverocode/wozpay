import { X, ArrowLeft } from 'lucide-react';

interface ExternalContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export function ExternalContentModal({ isOpen, onClose, title, url }: ExternalContentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header fijo */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h2 className="text-base font-bold text-white truncate flex-1 text-center">{title}</h2>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      {/* Iframe en pantalla completa */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={url}
          className="w-full h-full border-0"
          title={title}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          loading="lazy"
        />
      </div>
    </div>
  );
}