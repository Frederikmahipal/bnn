import { useState, useEffect } from 'react';
import { DocumentData, DocumentRecord } from '@/types/document';
import { TagSelector } from '@/components/TagSelector/TagSelector';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  editingDocument: DocumentRecord | null;
  uploading: boolean;
}

export function DocumentModal({
  isOpen,
  onClose,
  onSubmit,
  editingDocument,
  uploading
}: DocumentModalProps) {
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [documentData, setDocumentData] = useState<DocumentData>({
    title: '',
    description: '',
    tags: [],
    price: '',
    documentDate: ''
  });

  // Reset form data when modal opens or editingDocument changes
  useEffect(() => {
    if (isOpen) {
      if (editingDocument) {
        setDocumentData({
          title: editingDocument.title,
          description: editingDocument.description || '',
          tags: editingDocument.tags || [],
          price: editingDocument.price?.toString() || '',
          documentDate: editingDocument.documentDate 
            ? new Date(editingDocument.documentDate).toISOString().split('T')[0]
            : ''
        });
      } else {
        setDocumentData({
          title: '',
          description: '',
          tags: [],
          price: '',
          documentDate: ''
        });
        setAttachedFile(null);
      }
    }
  }, [isOpen, editingDocument]);

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFile(file);
      if (!documentData.title) {
        setDocumentData(prev => ({
          ...prev,
          title: file.name.split('.')[0]
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('metadata', JSON.stringify(documentData));
    
    if (attachedFile) {
      formData.append('file', attachedFile);
    }

    await onSubmit(formData);
    setAttachedFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title 
            </label>
            <input
              type="text"
              value={documentData.title}
              onChange={(e) => setDocumentData({ ...documentData, title: e.target.value })}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={documentData.description}
              onChange={(e) => setDocumentData({ ...documentData, description: e.target.value })}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <TagSelector
              selectedTags={documentData.tags}
              onTagsChange={(tags) => setDocumentData({ ...documentData, tags })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              value={documentData.price}
              onChange={(e) => setDocumentData({ ...documentData, price: e.target.value })}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Date
              <span className="text-gray-500 text-xs ml-1">(Optional - e.g., purchase date)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={documentData.documentDate}
                onChange={(e) => setDocumentData({ ...documentData, documentDate: e.target.value })}
                className="flex-1 px-3 py-2 border text-black border-gray-300 rounded-md"
              />
              {documentData.documentDate && (
                <button
                  type="button"
                  onClick={() => setDocumentData({ ...documentData, documentDate: '' })}
                  className="text-gray-500 hover:text-red-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachment
                </label>
                <p className="text-sm text-gray-500">
                  {attachedFile ? attachedFile.name : editingDocument?.fileName 
                    ? editingDocument.fileName 
                    : 'No file attached'}
                </p>
              </div>
              <label
                className="cursor-pointer bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors text-sm"
              >
                {attachedFile || editingDocument?.fileName ? 'Change File' : 'Attach File'}
                <input
                  type="file"
                  onChange={handleFileAttachment}
                  className="hidden text-black"
                />
              </label>
            </div>
            {editingDocument?.fileName && !attachedFile && (
              <p className="mt-2 text-xs text-gray-500">
                Current file will be kept unless you choose a new one
              </p>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                onClose();
                setAttachedFile(null);
              }}
              className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
              {uploading ? 'Uploading...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 