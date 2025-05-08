import { useState, useRef, useEffect } from 'react';
import { ITag } from '@/models/Tag';
import { useTags } from '@/hooks/useTags';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { tags, createTag, refreshTags } = useTags();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTagToggle = (tagName: string) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName)
      : [...selectedTags, tagName];
    onTagsChange(newSelectedTags);
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;

    try {
      setError('');
      const newTag = await createTag(newTagInput.trim());
      handleTagToggle(newTag.name);
      setNewTagInput('');
      // Refresh the tags list after creating a new tag
      await refreshTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateTag(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-full px-3 py-2 border text-black border-gray-300 rounded-md cursor-pointer min-h-[38px] flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTagToggle(tag);
                }}
              >
                {tag}
                <button
                  className="hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTagToggle(tag);
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">Select tags...</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2">
            <form onSubmit={handleCreateTag} className="mb-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 border text-black border-gray-300 rounded text-sm"
                placeholder="Create new tag..."
                onClick={(e) => e.stopPropagation()}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </form>

            <div className="max-h-48 overflow-y-auto">
              {tags.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">No tags available</p>
              ) : (
                tags.map(tag => (
                  <div
                    key={tag.name}
                    className={`px-2 py-1 cursor-pointer text-black hover:bg-gray-100 ${
                      selectedTags.includes(tag.name) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleTagToggle(tag.name)}
                  >
                    <span className="text-sm">{tag.name}</span>
                    {selectedTags.includes(tag.name) && (
                      <span className="float-right text-blue-600">✓</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 