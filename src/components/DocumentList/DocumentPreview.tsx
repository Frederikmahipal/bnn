import { DocumentRecord } from '@/types/document';

interface DocumentPreviewProps {
  document: DocumentRecord;
}

export function DocumentPreview({ document }: DocumentPreviewProps) {
  if (!document.attachment?.type || !document.attachment?.url) {
    return null;
  }

  return (
    <a
      href={document.attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="block w-full aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
    >
      {document.attachment.type.startsWith('image/') ? (
        <img 
          src={document.attachment.url} 
          alt={document.title}
          className="w-full h-full object-contain"
        />
      ) : document.attachment.type.startsWith('application/pdf') ? (
        <iframe
          src={`${document.attachment.url}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`}
          className="w-full h-full"
          title={document.title}
          style={{ 
            pointerEvents: 'none',
            border: 'none',
            background: 'white'
          }}
        />
      ) : document.attachment.type.startsWith('video/') ? (
        <video
          src={document.attachment.url}
          controls
          className="w-full h-full"
        >
          Your browser does not support the video tag.
        </video>
      ) : document.attachment.type.startsWith('audio/') ? (
        <audio
          src={document.attachment.url}
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
  );
} 