import { useState, useEffect, useCallback } from 'react';
import { DocumentRecord } from '@/types/document';

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocuments = useCallback(async (searchTerm?: string, tags?: string[]) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (tags?.length) {
        tags.forEach(tag => params.append('tags', tag));
      }

      const queryString = params.toString();
      const url = `/api/documents${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data);
      setError('');
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Error loading documents');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveDocument = async (formData: FormData, editingDocument: DocumentRecord | null) => {
    const url = editingDocument 
      ? `/api/files/${editingDocument._id}`
      : '/api/upload';

    const response = await fetch(url, {
      method: editingDocument ? 'PATCH' : 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to save document');
    }

    // Refresh the documents list
    await fetchDocuments();
  };

  const deleteDocument = async (id: string) => {
    const response = await fetch(`/api/files/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete document');
    }

    // Refresh the documents list
    await fetchDocuments();
  };

  // Initial fetch
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    setError,
    saveDocument,
    deleteDocument,
    fetchDocuments
  };
} 