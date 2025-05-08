import { useState, useEffect, useRef } from 'react';
import { DocumentRecord } from '@/types/document';

interface SearchAndFilterProps {
  documents: DocumentRecord[];
  onFilterChange: (filteredDocs: DocumentRecord[]) => void;
}

export function SearchAndFilter({ documents, onFilterChange }: SearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTagsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract unique tags from all documents
  useEffect(() => {
    const tags = new Set<string>();
    documents.forEach(doc => {
      doc.tags.forEach(tag => tags.add(tag));
    });
    setAvailableTags(Array.from(tags));
  }, [documents]);

  // Filter documents based on search term and selected tags
  useEffect(() => {
    const filtered = documents.filter(doc => {
      const matchesSearch = searchTerm === '' || 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.price?.toString().includes(searchTerm)) ||
        (doc.documentDate && new Date(doc.documentDate).toLocaleDateString().includes(searchTerm));

      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => doc.tags.includes(tag));

      return matchesSearch && matchesTags;
    });

    onFilterChange(filtered);
  }, [searchTerm, selectedTags, documents, onFilterChange]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-0">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search documents..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border text-black border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
        />
      </div>

      {/* Tag Filter Dropdown */}
      {availableTags.length > 0 && (
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsTagsDropdownOpen(!isTagsDropdownOpen)}
            className={`
              flex items-center justify-center gap-2 px-4 py-2.5 w-full sm:w-auto
              bg-white border border-gray-200 rounded-lg text-sm
              ${selectedTags.length > 0 ? 'text-blue-600' : 'text-gray-700'}
              hover:bg-gray-50 transition-colors
            `}
          >
            <svg 
              className={`h-5 w-5 ${selectedTags.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <span className="flex-1 text-left">Filter by tags</span>
            <svg 
              className={`h-5 w-5 transform transition-transform ${isTagsDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isTagsDropdownOpen && (
            <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-full sm:w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`
                    w-full px-4 py-2 text-left text-sm transition-colors
                    ${selectedTags.includes(tag)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                    flex items-center justify-between
                  `}
                >
                  <span>{tag}</span>
                  {selectedTags.includes(tag) && (
                    <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 