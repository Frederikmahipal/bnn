'use client'

import { useState } from 'react';
import { DocumentRecord } from '@/types/document';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentList } from '@/components/DocumentList/DocumentList';
import { DocumentModal } from '@/components/DocumentModal/DocumentModal';
import { DeleteModal } from '@/components/DeleteModal/DeleteModal';

export default function Dashboard() {
  const { documents, loading, error, saveDocument, deleteDocument, setError } = useDocuments();
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
      <main className="min-h-screen p-8">
        <div className="flex justify-center items-center h-full">
          <p>Loading documents...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-300">
      <div className="max-w-4xl mx-auto">
        {/* Add Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={openNewDocumentModal}
            className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
          >
            <span className="text-2xl">+</span>
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <DocumentList
          documents={documents}
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