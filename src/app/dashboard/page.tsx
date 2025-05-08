'use client'

import { useState, useEffect } from 'react'

interface DocumentData {
  title: string;
  description: string;
  tags: string[];
  price: string;
  documentDate: string;
}

interface DocumentRecord {
  _id: string;
  name?: string;  
  title: string;
  description?: string;
  tags: string[];
  price?: number;
  documentDate?: Date;
  type?: string;  
  size?: number;  
  url?: string;   
  createdAt: string;
  fileName?: string;
  attachment?: {
    type: string;
    url: string;
  };
}

export default function Dashboard() {
  const [files, setFiles] = useState<File[]>([])
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set())
  const [tagInput, setTagInput] = useState('')
  const [documentData, setDocumentData] = useState<DocumentData>({
    title: '',
    description: '',
    tags: [],
    price: '',
    documentDate: new Date().toISOString().split('T')[0]
  })
  const [editingDocument, setEditingDocument] = useState<DocumentRecord | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingDocument, setDeletingDocument] = useState<DocumentRecord | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/files')
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      const data = await response.json()
      setDocuments(data)
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError('Error loading documents')
    } finally {
      setLoading(false)
    }
  }

  const handleFileAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAttachedFile(file)
      if (!documentData.title) {
        setDocumentData(prev => ({
          ...prev,
          title: file.name.split('.')[0]
        }))
      }
    }
  }

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (!documentData.tags.includes(newTag)) {
        setDocumentData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }))
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setDocumentData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setError('')

    try {
      const dataToSend = {
        title: documentData.title,
        description: documentData.description,
        tags: documentData.tags,
        price: documentData.price ? parseFloat(documentData.price) : undefined,
        documentDate: documentData.documentDate || undefined
      };

      console.log('Sending document data:', dataToSend);

      const formData = new FormData()
      formData.append('metadata', JSON.stringify(dataToSend))
      
      // Only append file if one is selected
      if (attachedFile instanceof File) {
        formData.append('file', attachedFile)
      }

      const url = editingDocument 
        ? `/api/files/${editingDocument._id}` 
        : '/api/upload'

      const response = await fetch(url, {
        method: editingDocument ? 'PATCH' : 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save error response:', errorData);
        throw new Error(errorData.error || 'Save failed');
      }

      const savedDocument = await response.json()
      console.log('Save response:', savedDocument);

      setDocuments(prev => {
        if (editingDocument) {
          // Update existing document
          return prev.map(doc => 
            doc._id === editingDocument._id ? savedDocument : doc
          )
        }
        // Add new document
        return [savedDocument, ...prev]
      })

      setShowDocumentModal(false)
      setAttachedFile(null)
      setEditingDocument(null)
      setDocumentData({
        title: '',
        description: '',
        tags: [],
        price: '',
        documentDate: new Date().toISOString().split('T')[0]
      })
    } catch (err) {
      console.error('Save error:', err)
      setError('Error saving document')
    } finally {
      setUploading(false)
    }
  }

  const openNewDocumentModal = () => {
    setEditingDocument(null)
    setAttachedFile(null)
    setDocumentData({
      title: '',
      description: '',
      tags: [],
      price: '',
      documentDate: new Date().toISOString().split('T')[0]
    })
    setShowDocumentModal(true)
  }

  const openEditDocumentModal = (doc: DocumentRecord, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent expanding/collapsing when clicking edit
    setEditingDocument(doc)
    setDocumentData({
      title: doc.title,
      description: doc.description || '',
      tags: doc.tags || [],
      price: doc.price?.toString() || '',
      documentDate: doc.documentDate 
        ? new Date(doc.documentDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    })
    setShowDocumentModal(true)
  }

  const openDeleteModal = (doc: DocumentRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingDocument(doc)
    setDeleteConfirmation('')
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!deletingDocument || deleteConfirmation !== deletingDocument.title) {
      return
    }

    try {
      const response = await fetch(`/api/files/${deletingDocument._id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Delete failed')
      }

      // Remove the document from the list
      setDocuments(prev => prev.filter(doc => doc._id !== deletingDocument._id))
      setShowDeleteModal(false)
      setDeletingDocument(null)
      setDeleteConfirmation('')
    } catch (err) {
      console.error('Delete error:', err)
      setError('Error deleting document')
    }
  }

  const toggleDocumentExpand = (docId: string) => {
    setExpandedDocuments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(docId)) {
        newSet.delete(docId)
      } else {
        newSet.add(docId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="flex justify-center items-center h-full">
          <p>Loading documents...</p>
        </div>
      </main>
    )
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

        {/* Documents List */}
        {documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc) => {
              const isExpanded = expandedDocuments.has(doc._id)
              const formattedDate = doc.documentDate 
                ? new Date(doc.documentDate).toLocaleDateString()
                : new Date(doc.createdAt).toLocaleDateString()

              return (
                <div 
                  key={doc._id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => toggleDocumentExpand(doc._id)}
                >
                  {/* Compact View */}
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{doc.title}</h3>
                      <div className="flex gap-4 text-sm text-gray-500 mt-1">
                        <span>{formattedDate}</span>
                        {doc.price && (
                          <span className="text-green-600">${doc.price}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isExpanded && (
                        <>
                          <button
                            onClick={(e) => openEditDocumentModal(doc, e)}
                            className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50"
                          >
                            <svg 
                              className="w-4 h-4" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                              />
                            </svg>
                            <span className="text-sm">Edit</span>
                          </button>
                          <button
                            onClick={(e) => openDeleteModal(doc, e)}
                            className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50"
                          >
                            <svg 
                              className="w-4 h-4" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                              />
                            </svg>
                            <span className="text-sm">Delete</span>
                          </button>
                        </>
                      )}
                      <svg 
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="flex gap-6">
                        {/* Content Section */}
                        <div className="flex-1">
                          {doc.description && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-gray-700">Description</h4>
                              <p className="mt-1 text-sm text-gray-600">{doc.description}</p>
                            </div>
                          )}
                          
                          {Array.isArray(doc.tags) && doc.tags.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-gray-700">Tags</h4>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {doc.tags.map((tag, i) => (
                                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-700">Document Details</h4>
                            <div className="mt-1 text-sm text-gray-600">
                              <p>Original filename: {doc.fileName || 'No file attached'}</p>
                              <p>Type: {doc.attachment?.type || 'N/A'}</p>
                              <p>Uploaded: {new Date(doc.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        {/* Preview Section */}
                        {doc.attachment?.type && doc.attachment?.url && (
                          <div className="w-64 flex-shrink-0">
                            <a
                              href={doc.attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="block w-full aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                            >
                              {doc.attachment.type.startsWith('image/') ? (
                                <img 
                                  src={doc.attachment.url} 
                                  alt={doc.title}
                                  className="w-full h-full object-contain"
                                />
                              ) : doc.attachment.type.startsWith('application/pdf') ? (
                                <iframe
                                  src={`${doc.attachment.url}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`}
                                  className="w-full h-full"
                                  title={doc.title}
                                  style={{ 
                                    pointerEvents: 'none',
                                    border: 'none',
                                    background: 'white'
                                  }}
                                />
                              ) : doc.attachment.type.startsWith('video/') ? (
                                <video
                                  src={doc.attachment.url}
                                  controls
                                  className="w-full h-full"
                                >
                                  Your browser does not support the video tag.
                                </video>
                              ) : doc.attachment.type.startsWith('audio/') ? (
                                <audio
                                  src={doc.attachment.url}
                                  controls
                                  className="w-full mt-16"
                                >
                                  Your browser does not support the audio tag.
                                </audio>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="text-center">
                                    <svg 
                                      className="mx-auto h-12 w-12 text-gray-400" 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                                      />
                                    </svg>
                                    <p className="mt-1 text-sm text-gray-500">
                                      Click to view file
                                    </p>
                                  </div>
                                </div>
                              )}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No documents yet
          </div>
        )}
      </div>

      {/* Document Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <form onSubmit={handleDocumentSubmit} className="space-y-4">
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
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInput}
                    className="w-full px-3 py-2 border text-black placeholder:text-gray-300 border-gray-300 rounded-md"
                    placeholder="Type tag and press Enter"
                  />
                  <div className="flex flex-wrap gap-2">
                    {documentData.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-1 group"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
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
                </label>
                <input
                  type="date"
                  value={documentData.documentDate}
                  onChange={(e) => setDocumentData({ ...documentData, documentDate: e.target.value })}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                />
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
                    setShowDocumentModal(false)
                    setAttachedFile(null)
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
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingDocument && (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Document</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <p className="text-gray-600 mb-2">
              To confirm, type <span className="font-medium">{deletingDocument.title}</span> below:
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md mb-4"
              placeholder="Type document title to confirm"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingDocument(null)
                  setDeleteConfirmation('')
                }}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteConfirmation !== deletingDocument.title}
                className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                  deleteConfirmation === deletingDocument.title
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
} 