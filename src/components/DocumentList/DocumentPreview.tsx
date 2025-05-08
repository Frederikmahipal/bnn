import { DocumentRecord } from '@/types/document';
import { useState } from 'react';

interface DocumentPreviewProps {
  document: DocumentRecord;
}

export function DocumentPreview({ document }: DocumentPreviewProps) {
  const [hasError, setHasError] = useState(false);

  if (!document.attachment?.type || !document.attachment?.url || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
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
            No file available
          </p>
        </div>
      </div>
    );
  }

  const isPDF = document.attachment.type.startsWith('application/pdf');
  const isImage = document.attachment.type.startsWith('image/');
  const isVideo = document.attachment.type.startsWith('video/');
  const isAudio = document.attachment.type.startsWith('audio/');

  return (
    <div className={`
      w-full rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all
      ${isPDF ? 'h-[200px]' : 'aspect-[3/4]'}
      relative group
    `}>
      {isImage && (
        <a
          href={document.attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="block w-full h-full"
        >
          <img 
            src={document.attachment.url} 
            alt={document.title}
            className="w-full h-full object-contain"
            onError={() => setHasError(true)}
          />
        </a>
      )}

      {isPDF && (
        <>
          <div className="relative w-full h-full">
            <iframe
              src={document.attachment.url}
              className="w-full h-full bg-white"
              style={{ border: 'none' }}
              title={document.title}
              onError={() => setHasError(true)}
            />
            <a
              href={document.attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-all group"
            >
              <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                Open PDF
              </span>
            </a>
          </div>
        </>
      )}

      {isVideo && (
        <video
          src={document.attachment.url}
          controls
          className="w-full h-full"
          onClick={(e) => e.stopPropagation()}
          onError={() => setHasError(true)}
        >
          Your browser does not support the video tag.
        </video>
      )}

      {isAudio && (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4">
          <audio
            src={document.attachment.url}
            controls
            className="w-full"
            onClick={(e) => e.stopPropagation()}
            onError={() => setHasError(true)}
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      )}

      {!isPDF && !isImage && !isVideo && !isAudio && (
        <a
          href={document.attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-full h-full flex items-center justify-center bg-gray-50"
        >
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
        </a>
      )}
    </div>
  );
} 