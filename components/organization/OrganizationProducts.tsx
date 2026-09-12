'use client';

import { useRef, useState } from 'react';
import { classNames } from '@/lib/cx';
import type { useOrganizationWorkspace } from '@/lib/organization/use-organization-workspace';
import type { LoanProduct, Product, TemplateDraft } from '@/lib/organization/workspace-data';
import styles from '@/styles/OrganizationWorkspace.module.css';

const cx = classNames(styles);

type Workspace = ReturnType<typeof useOrganizationWorkspace>;

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

export function OrganizationProducts({ workspace }: { workspace: Workspace }) {
  const {
    role, cfg, user, products, loanProducts, openCatalogModal, downloadCsvTemplate, importProducts,
    offerTemplates, archivedTemplates, templateDraft, setTemplateDraft, saveTemplate, archiveTemplate,
    restoreTemplate, makeTemplateDefault
  } = workspace;
  const fileInput = useRef<HTMLInputElement>(null);

  /** Which products have their archive drawer open. Closed is the resting state:
   *  an archive is for the rare day something needs fetching back. */
  const [openArchives, setOpenArchives] = useState<Record<string, boolean>>({});
  const toggleArchive = (productId: string) =>
    setOpenArchives(current => ({ ...current, [productId]: !current[productId] }));

  /** A blank template for a product, in the vocabulary the valuation reads. */
  const blankTemplate = (productId: string, productName: string): TemplateDraft => ({
    productId,
    productName,
    name: '',
    description: '',
    value: '',
    conditions: '',
    nextSteps: '',
    responseWindowDays: '14',
    /**
     * A university template no longer restates its course's tuition or
     * duration — those travel with the offer from the product itself — and its
     * scholarship is the one benefit line, not a second percentage field. The
     * deposit is all that is left for the template to state on its own.
     */
    terms: role === 'BANK'
      ? { loanAmount: '', interestRate: '', tenure: '' }
      : { depositAmount: '' },
    isDefault: false
  });

  const templatesFor = (productId: string) =>
    offerTemplates.filter((template: { productId: string }) => template.productId === productId);

  const archivedFor = (productId: string) =>
    archivedTemplates.filter((template: { productId: string }) => template.productId === productId);

  const catalog: Array<Product | LoanProduct> = role === 'BANK' ? loanProducts : products;

  return (
    <section className={cx('uni-view')}>
      <header className={cx('uni-page-title')}>
        <div>
          <span>{role === 'BANK' ? 'FINANCIAL PRODUCTS & UNDERWRITING' : 'Product Management'}</span>
          <h1>{role === 'BANK' ? 'Loan Products' : 'Products'}</h1>
          <p>
            {role === 'BANK'
              ? 'Manage loan products, underwriting criteria, and their standard offer templates.'
              : 'Manage course offerings, admission criteria, and their standard offer templates.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            onClick={downloadCsvTemplate}
            style={{ background: 'transparent', border: 'none', color: '#047857', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
          >
            Download CSV Template
          </button>
          <input
            type="file"
            ref={fileInput}
            style={{ display: 'none' }}
            accept=".csv"
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) importProducts(file, () => { if (fileInput.current) fileInput.current.value = ''; });
            }}
          />
          <button className={cx('uni-secondary')} onClick={() => fileInput.current?.click()} style={{ padding: '0 16px', height: 36 }}>
            Import via CSV
          </button>
          <button className={cx('uni-primary')} onClick={() => openCatalogModal()}>
            + Add {role === 'BANK' ? 'loan product' : 'product'}
          </button>
        </div>
      </header>

      <section className={cx('uni-card')} style={{ marginBottom: 24 }}>
        <div className={cx('product-catalog')}>
          {catalog.map(item => (
            <article key={item.id}>
              <span className={cx('product-mark')}>{item.name.charAt(0)}</span>
              <div className={cx('product-name')}>
                <h2>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'underline', textDecorationColor: '#d8d8d5', textUnderlineOffset: 4 }}
                      onClick={event => event.stopPropagation()}
                    >
                      {item.name} ↗
                    </a>
                  ) : (
                    item.name
                  )}
                </h2>
                <p>Created by {user?.full_name || cfg.userTitle}{item.createdAt ? ` on ${formatDate(item.createdAt)}` : ''}</p>
              </div>
              <div style={{ fontSize: 13, color: '#52525b', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {item.lastModifiedAt && (
                  <>
                    Last modified<br />
                    <span style={{ color: '#18181b', fontWeight: 500 }}>{formatDate(item.lastModifiedAt)}</span>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => openCatalogModal(item)}>Edit</button>
              </div>

              {/*
                * The offers this product is prepared to make. A one-click
                * invitation sends whichever is marked default, so a product
                * without one says so rather than letting an officer click into
                * nothing.
                */}
              <div className={cx('product-templates')}>
                <header>
                  <span>Offer templates</span>
                  <button type="button" onClick={() => setTemplateDraft(blankTemplate(item.id, item.name))}>
                    + Add template
                  </button>
                </header>

                {!templatesFor(item.id).length && (
                  <p className={cx('product-templates-empty')}>
                    None yet — add one so this product can be sent with a single click.
                  </p>
                )}

                {templatesFor(item.id).map((template: any) => (
                  <div key={template.id} className={cx('product-template-row')}>
                    <div>
                      <strong>{template.name}</strong>
                      {template.isDefault && <span className={cx('template-default')}>One-click</span>}
                      <small>
                        {template.value || (role === 'BANK' ? 'No headline figure' : 'No benefit stated')}
                        {template.usedCount ? ` · sent ${template.usedCount}×` : ' · never sent'}
                      </small>
                    </div>
                    <div className={cx('product-template-actions')}>
                      {!template.isDefault && (
                        <button type="button" onClick={() => makeTemplateDefault(template.id)}>
                          Make one-click
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setTemplateDraft({
                          ...blankTemplate(item.id, item.name),
                          id: template.id,
                          name: template.name,
                          description: template.description || '',
                          value: template.value || '',
                          conditions: template.conditions || '',
                          nextSteps: (template.nextSteps || []).join('\n'),
                          responseWindowDays: String(template.responseWindowDays || 14),
                          terms: { ...blankTemplate(item.id, item.name).terms, ...(template.terms || {}) },
                          isDefault: template.isDefault
                        })}
                      >
                        Edit
                      </button>
                      <button type="button" className={cx('template-archive')} onClick={() => archiveTemplate(template.id)}>
                        Archive
                      </button>
                    </div>
                  </div>
                ))}

                {/*
                  * The way back out. Archiving is a soft delete — offers already
                  * sent point at the row, so it cannot be removed — but until
                  * now nothing listed the put-away ones, which made a button
                  * marked "Archive" a delete in all but name. Closed by default:
                  * this is a drawer, not part of the working list.
                  */}
                {!!archivedFor(item.id).length && (
                  <div className={cx('template-archive-drawer')}>
                    <button
                      type="button"
                      className={cx('template-archive-toggle')}
                      aria-expanded={!!openArchives[item.id]}
                      onClick={() => toggleArchive(item.id)}
                    >
                      <span className={cx('template-archive-caret', openArchives[item.id] && 'open')} aria-hidden="true">▸</span>
                      Archived ({archivedFor(item.id).length})
                    </button>

                    {openArchives[item.id] && archivedFor(item.id).map((template: any) => (
                      <div key={template.id} className={cx('product-template-row', 'template-archived-row')}>
                        <div>
                          <strong>{template.name}</strong>
                          <small>
                            {template.value || (role === 'BANK' ? 'No headline figure' : 'No benefit stated')}
                            {template.usedCount ? ` · sent ${template.usedCount}×` : ' · never sent'}
                          </small>
                        </div>
                        <div className={cx('product-template-actions')}>
                          <button type="button" onClick={() => restoreTemplate(template.id)}>Restore</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
          {!catalog.length && (
            <div className={cx('empty-state')}>
              <strong>No {role === 'BANK' ? 'loan products' : 'products'} yet</strong>
              <p>Add your first product to start receiving matched students.</p>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
