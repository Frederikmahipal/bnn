import { DocumentRecord } from '@/types/document';
import { DocumentPreview } from './DocumentPreview';

interface DocumentItemProps {
  doc: DocumentRecord;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onEdit: (doc: DocumentRecord, e: React.MouseEvent) => void;
  onDelete: (doc: DocumentRecord, e: React.MouseEvent) => void;
}

export function DocumentItem({ 
  doc, 
  isExpanded, 
  onToggleExpand, 
  onEdit, 
  onDelete 
}: DocumentItemProps) {
  const formattedDocumentDate = doc.documentDate 
    ? new Date(doc.documentDate).toLocaleDateString()
    : null;

  const formattedUploadDate = new Date(doc.createdAt).toLocaleDateString();

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onToggleExpand(doc._id)}
    >
      {/* Compact View */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{doc.title}</h3>
          <div className="flex gap-4 text-sm text-gray-500 mt-1">
            {formattedDocumentDate && (
              <span>Document date: {formattedDocumentDate}</span>
            )}
            {doc.price && (
              <span className="text-green-600">${doc.price}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isExpanded && (
            <>
              <button
                onClick={(e) => onEdit(doc, e)}
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
                <span className="text-sm">Rediger</span>
              </button>
              <button
                onClick={(e) => onDelete(doc, e)}
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
                <span className="text-sm">Slet</span>
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
                  <h4 className="text-sm font-medium text-gray-700">Beskrivelse</h4>
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
                <h4 className="text-sm font-medium text-gray-700">Info</h4>
                <div className="mt-1 text-sm text-gray-600">
                  <p>Type: {doc.attachment?.type || 'N/A'}</p>
                  <p>Uploaded: {formattedUploadDate}</p>
                  {formattedDocumentDate && (
                    <p>Document date: {formattedDocumentDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {doc.attachment?.type && doc.attachment?.url && (
              <div className="w-64 flex-shrink-0">
                <DocumentPreview document={doc} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 