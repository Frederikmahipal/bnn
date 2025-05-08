import { DocumentRecord } from '@/types/document';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  document: DocumentRecord | null;
  confirmationText: string;
  onConfirmationTextChange: (text: string) => void;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  document,
  confirmationText,
  onConfirmationTextChange
}: DeleteModalProps) {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Document</h2>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this document? This action cannot be undone.
        </p>
        <p className="text-gray-600 mb-2">
          To confirm, type <span className="font-medium">{document.title}</span> below:
        </p>
        <input
          type="text"
          value={confirmationText}
          onChange={(e) => onConfirmationTextChange(e.target.value)}
          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md mb-4"
          placeholder="Type document title to confirm"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmationText !== document.title}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              confirmationText === document.title
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-100 text-gray-400 border border-gray-200'
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 