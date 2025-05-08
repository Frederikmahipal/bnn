import { useState, useEffect } from 'react';
import { DocumentRecord, DocumentData } from '@/types/document';

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/files');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Error loading documents');
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async (
    formData: FormData,
    editingDocument: DocumentRecord | null
  ) => {
    try {
      const url = editingDocument 
        ? `/api/files/${editingDocument._id}` 
        : '/api/upload';

      const response = await fetch(url, {
        method: editingDocument ? 'PATCH' : 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Save failed');
      }

      const savedDocument = await response.json();

      setDocuments(prev => {
        if (editingDocument) {
          return prev.map(doc => 
            doc._id === editingDocument._id ? savedDocument : doc
          );
        }
        return [savedDocument, ...prev];
      });

      return savedDocument;
    } catch (err) {
      console.error('Save error:', err);
      throw err;
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/files/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      setDocuments(prev => prev.filter(doc => doc._id !== documentId));
    } catch (err) {
      console.error('Delete error:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
    saveDocument,
    deleteDocument,
    setError
  };
} 