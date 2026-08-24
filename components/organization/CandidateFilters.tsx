'use client';

import { classNames } from '@/lib/cx';
import type { useOrganizationWorkspace } from '@/lib/organization/use-organization-workspace';
import styles from '@/styles/OrganizationWorkspace.module.css';

const cx = classNames(styles);

type Workspace = ReturnType<typeof useOrganizationWorkspace>;

/** The bank-only options read as codes in the API; officers get plain words. */
const OPTION_LABELS: Record<string, string> = {
  academicOnly: 'No university offer yet',
  offerAvailable: 'Already holds an offer',
  yes: 'Yes',
  no: 'No'
};

/**
 * Discovery search and filters. Every field here maps to a query parameter the
 * backend applies — nothing is filtered in the browser, so the counts and the
 * results always agree with what the server would return.
 */
export function CandidateFilters({ workspace }: { workspace: Workspace }) {
  const {
    role, filters, setFilter, clearFilters, activeFilterCount,
    filtersOpen, setFiltersOpen, searching, filterFields, candidates
  } = workspace;

  return (
    <>
      <div className={cx('candidate-feed-search')}>
        <label className={cx('feed-search-box')}>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            name="candidateSearch"
            value={filters.search}
            placeholder={role === 'BANK' ? 'Search applicants by name or course' : 'Search students by name or course'}
            aria-label="Search candidates"
            onChange={event => setFilter('search', event.target.value)}
          />
          {!!filters.search && (
            <button type="button" aria-label="Clear search" onClick={() => setFilter('search', '')}>✕</button>
          )}
        </label>

        <button
          type="button"
          className={cx('feed-filter-toggle', (filtersOpen || !!activeFilterCount) && 'active')}
          aria-expanded={filtersOpen}
          aria-label={`${filtersOpen ? 'Hide' : 'Show'} filters`}
          title="Filters"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          {!!activeFilterCount && <b>{activeFilterCount}</b>}
        </button>
      </div>

      {filtersOpen && (
        <div className={cx('candidate-filter-panel', 'candidate-filter-inline')}>
          <div className={cx('filter-panel-grid')}>
            {filterFields.map(section => (
              <div key={section.group} className={cx('filter-rail-group')}>
                <h3>{section.group}</h3>
                {section.fields.map(field => (
                  <label key={field.key}>
                    {field.label}
                    {field.type === 'select' ? (
                      <select
                        value={filters[field.key]}
                        onChange={event => setFilter(field.key, event.target.value)}
                      >
                        <option value="">Any</option>
                        {(field.options || []).map(option => (
                          <option key={option} value={option}>{OPTION_LABELS[option] || option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        step={field.step}
                        min={field.type === 'number' ? '0' : undefined}
                        placeholder={field.placeholder}
                        value={filters[field.key]}
                        onChange={event => setFilter(field.key, event.target.value)}
                      />
                    )}
                  </label>
                ))}
              </div>
            ))}
          </div>

          <div className={cx('filter-panel-footer')}>
            <span className={cx('filter-result-count')}>
              {searching ? 'Searching…' : `${candidates.length} ${candidates.length === 1 ? 'match' : 'matches'}`}
            </span>
            <button type="button" className={cx('uni-secondary')} disabled={!activeFilterCount} onClick={clearFilters}>
              Clear filters
            </button>
            <button type="button" className={cx('uni-primary')} onClick={() => setFiltersOpen(false)}>Done</button>
          </div>
        </div>
      )}
    </>
  );
}
