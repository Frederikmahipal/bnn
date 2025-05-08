import { DocumentRecord } from '@/types/document';
import { DocumentPreview } from './DocumentPreview';
import { formatPrice } from '@/utils/format';

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
    ? new Date(doc.documentDate).toLocaleDateString('da-DK')
    : null;

  const formattedUploadDate = new Date(doc.createdAt).toLocaleDateString('da-DK');

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onToggleExpand(doc._id)}
    >
      {/* Main View (Always Visible) */}
      <div className="p-4">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{doc.title}</h3>
            <div className="flex gap-4 text-sm text-gray-500 mt-1">
              {formattedDocumentDate && (
                <span>{formattedDocumentDate}</span>
              )}
              {doc.price && (
                <span className="text-green-600 font-medium">{formatPrice(doc.price)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {isExpanded && (
              <>
                <button
                  onClick={(e) => onEdit(doc, e)}
                  className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-sm">Rediger</span>
                </button>
                <button
                  onClick={(e) => onDelete(doc, e)}
                  className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

        {/* Tags Section - Always visible */}
        {Array.isArray(doc.tags) && doc.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {doc.tags.map((tag, i) => (
              <span 
                key={i} 
                className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Description Section */}
            <div className="md:col-span-2 space-y-4 flex flex-col">
              {doc.description && (
                <div className="bg-gray-50 p-4 rounded-lg flex-grow">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Beskrivelse</h4>
                  <p className="text-sm text-gray-600">{doc.description}</p>
                </div>
              )}
              
              {/* Document Info */}
              <div className="bg-gray-50 p-4 rounded-lg flex-grow">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Fil</p>
                    <p className="font-medium text-gray-900">
                      {doc.fileName || doc.attachment?.name ? (
                        doc.fileName || doc.attachment?.name
                      ) : (
                        <span className="text-gray-400 italic">No file attached</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Uploaded</p>
                    <p className="font-medium text-gray-900">{formattedUploadDate}</p>
                  </div>
                  {formattedDocumentDate && (
                    <div>
                      <p className="text-gray-600">dato</p>
                      <p className="font-medium text-gray-900">{formattedDocumentDate}</p>
                    </div>
                  )}
                  {doc.price && (
                    <div>
                      <p className="text-gray-600">Pris</p>
                      <p className="font-medium text-gray-900">{formatPrice(doc.price)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {doc.attachment?.url && doc.attachment?.type ? (
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg h-full">
                  <DocumentPreview document={doc} />
                </div>
              </div>
            ) : (
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg h-full flex items-center justify-center">
                  <div className="text-center">
                    <svg 
                      className="mx-auto h-12 w-12 text-gray-300" 
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
                    <p className="mt-2 text-sm text-gray-400">
                      Ingen fil vedhæftet
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 