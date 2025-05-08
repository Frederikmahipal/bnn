import { DocumentRecord } from '@/types/document';
import { DocumentItem } from './DocumentItem';

interface DocumentListProps {
  documents: DocumentRecord[];
  expandedDocuments: Set<string>;
  onToggleExpand: (id: string) => void;
  onEdit: (doc: DocumentRecord, e: React.MouseEvent) => void;
  onDelete: (doc: DocumentRecord, e: React.MouseEvent) => void;
}

export function DocumentList({
  documents,
  expandedDocuments,
  onToggleExpand,
  onEdit,
  onDelete
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No documents found</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <DocumentItem
          key={doc._id}
          doc={doc}
          isExpanded={expandedDocuments.has(doc._id)}
          onToggleExpand={onToggleExpand}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
} 