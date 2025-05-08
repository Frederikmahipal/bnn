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
      <div className="text-center text-gray-500">
        No documents yet
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