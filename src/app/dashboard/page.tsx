'use client'

import { useState } from 'react';
import { DocumentRecord } from '@/types/document';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentList } from '@/components/DocumentList/DocumentList';
import { DocumentModal } from '@/components/DocumentModal/DocumentModal';
import { DeleteModal } from '@/components/DeleteModal/DeleteModal';
import { SearchAndFilter } from '@/components/SearchAndFilter/SearchAndFilter';

export default function Dashboard() {
  const { documents, loading, error, saveDocument, deleteDocument, setError } = useDocuments();
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set());
  const [editingDocument, setEditingDocument] = useState<DocumentRecord | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<DocumentRecord | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleDocumentSubmit = async (formData: FormData) => {
    setUploading(true);
    setError('');

    try {
      await saveDocument(formData, editingDocument);
      setShowDocumentModal(false);
      setEditingDocument(null);
    } catch (err) {
      setError('Error saving document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDocument || deleteConfirmation !== deletingDocument.title) {
      return;
    }

    try {
      await deleteDocument(deletingDocument._id);
      setShowDeleteModal(false);
      setDeletingDocument(null);
      setDeleteConfirmation('');
    } catch (err) {
      setError('Error deleting document');
    }
  };

  const toggleDocumentExpand = (docId: string) => {
    setExpandedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const openNewDocumentModal = () => {
    setEditingDocument(null);
    setShowDocumentModal(true);
  };

  const openEditDocumentModal = (doc: DocumentRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDocument(doc);
    setShowDocumentModal(true);
  };

  const openDeleteModal = (doc: DocumentRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingDocument(doc);
    setDeleteConfirmation('');
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-200">
        <div className="flex justify-center items-center h-full">
          <div className="flex items-center space-x-3 text-gray-500">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading documents...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="flex-1 min-w-0">
            <SearchAndFilter 
              documents={documents} 
              onFilterChange={setFilteredDocuments} 
            />
          </div>
          <button
            onClick={openNewDocumentModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Document
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <DocumentList
          documents={filteredDocuments.length > 0 ? filteredDocuments : documents}
          expandedDocuments={expandedDocuments}
          onToggleExpand={toggleDocumentExpand}
          onEdit={openEditDocumentModal}
          onDelete={openDeleteModal}
        />

        <DocumentModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          onSubmit={handleDocumentSubmit}
          editingDocument={editingDocument}
          uploading={uploading}
        />

        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingDocument(null);
            setDeleteConfirmation('');
          }}
          onConfirm={handleDelete}
          document={deletingDocument}
          confirmationText={deleteConfirmation}
          onConfirmationTextChange={setDeleteConfirmation}
        />
      </div>
    </main>
  );
} 