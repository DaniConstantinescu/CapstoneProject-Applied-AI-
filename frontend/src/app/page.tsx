'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Select,
  SelectItem,
  InlineLoading,
} from '@carbon/react';
import { Book, Category, AuthorSummary } from '../lib/types';
import { api } from '../lib/api';
import { BookGrid } from '../components/BookGrid';

function CatalogueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') || '';
  const categoryIdParam = searchParams.get('categoryId');
  const authorIdParam = searchParams.get('authorId');
  const sort = searchParams.get('sort') || 'relevance';

  const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;
  const authorId = authorIdParam ? Number(authorIdParam) : undefined;

  const isFiltered = Boolean(q || categoryId || authorId || sort !== 'relevance');

  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<AuthorSummary[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(q);

  // Load static filter data (categories and authors) once
  useEffect(() => {
    async function loadFilters() {
      try {
        const [catRes, authRes] = await Promise.all([
          api.get<{ items: Category[] }>('/categories'),
          api.get<{ items: AuthorSummary[] }>('/authors'),
        ]);
        setCategories(catRes.items);
        setAuthors(authRes.items);
      } catch (err) {
        console.error('Failed to load catalogue filters:', err);
      }
    }
    loadFilters();
  }, []);

  // Sync search input when url changes
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // Load books and recommendations
  const loadCatalogue = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (categoryId) params.set('categoryId', String(categoryId));
      if (authorId) params.set('authorId', String(authorId));
      if (sort) params.set('sort', sort);

      const [booksRes, recsRes] = await Promise.all([
        api.get<{ items: Book[] }>(`/books?${params.toString()}`),
        !isFiltered ? api.get<{ items: Book[] }>('/recommendations') : Promise.resolve({ items: [] }),
      ]);

      setBooks(booksRes.items);
      if (!isFiltered) {
        setRecommendations(recsRes.items);
      }
    } catch (err) {
      console.error('Failed to load catalogue books:', err);
    } finally {
      setLoading(false);
    }
  }, [q, categoryId, authorId, sort, isFiltered]);

  useEffect(() => {
    loadCatalogue();
  }, [loadCatalogue]);

  const updateParam = (key: string, value?: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all' && value !== '') {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    router.push(`/?${nextParams.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('q', searchInput);
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      {/* Left Category Sidebar */}
      <aside
        style={{
          width: '220px',
          flexShrink: 0,
          backgroundColor: '#262626',
          borderRadius: '4px',
          padding: '1.25rem',
        }}
      >
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#f4f4f4' }}>
          Categories
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <button
              onClick={() => updateParam('categoryId', undefined)}
              style={{
                background: 'none',
                border: 'none',
                color: !categoryId ? '#78a9ff' : '#c6c6c6',
                fontWeight: !categoryId ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                padding: '0.375rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: !categoryId ? '#393939' : 'transparent',
              }}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => {
            const isSelected = categoryId === cat.id;
            return (
              <li key={cat.id} style={{ marginBottom: '0.25rem' }}>
                <button
                  onClick={() => updateParam('categoryId', String(cat.id))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isSelected ? '#78a9ff' : '#c6c6c6',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    padding: '0.375rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: isSelected ? '#393939' : 'transparent',
                  }}
                >
                  {cat.name}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 300px' }}>
            <form onSubmit={handleSearchSubmit}>
              <Search
                id="search-books"
                labelText="Search books by title or author"
                placeholder="Search by title or author..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onClear={() => {
                  setSearchInput('');
                  updateParam('q', undefined);
                }}
              />
            </form>
          </div>

          <div style={{ width: '200px' }}>
            <Select
              id="author-filter"
              labelText="Author"
              hideLabel
              value={authorId ? String(authorId) : 'all'}
              onChange={(e) => updateParam('authorId', e.target.value)}
            >
              <SelectItem value="all" text="All Authors" />
              {authors.map((a) => (
                <SelectItem key={a.id} value={String(a.id)} text={a.name} />
              ))}
            </Select>
          </div>

          <div style={{ width: '200px' }}>
            <Select
              id="sort-select"
              labelText="Sort By"
              hideLabel
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
            >
              <SelectItem value="relevance" text="Sort: Relevance" />
              <SelectItem value="price_asc" text="Price: Low to High" />
              <SelectItem value="price_desc" text="Price: High to Low" />
              <SelectItem value="title_asc" text="Title: A to Z" />
            </Select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <InlineLoading description="Loading books..." />
          </div>
        ) : (
          <>
            {/* Recommended for You section (unfiltered home only) */}
            {!isFiltered && recommendations.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <BookGrid books={recommendations} title="Recommended for You" />
              </div>
            )}

            {/* Main Books Grid */}
            <BookGrid
              books={books}
              title={isFiltered ? 'Search Results' : 'All Books'}
              emptyMessage="No books found matching your selected filters."
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center' }}><InlineLoading description="Loading catalogue..." /></div>}>
      <CatalogueContent />
    </Suspense>
  );
}
