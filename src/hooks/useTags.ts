import { useState, useEffect, useCallback } from 'react';
import { ITag } from '@/models/Tag';

export function useTags() {
  const [tags, setTags] = useState<ITag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data = await response.json();
      setTags(data);
      setError('');
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Error loading tags');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTag = async (name: string) => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create tag');
      }

      const newTag = await response.json();
      setTags(prev => [...prev, newTag]);
      return newTag;
    } catch (err) {
      console.error('Error creating tag:', err);
      throw err;
    }
  };

  const refreshTags = useCallback(async () => {
    await fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    createTag,
    refreshTags
  };
} 