'use client';

import { classNames } from '@/lib/cx';
import type { useOrganizationWorkspace } from '@/lib/organization/use-organization-workspace';
import styles from '@/styles/OrganizationWorkspace.module.css';

const cx = classNames(styles);

type Workspace = ReturnType<typeof useOrganizationWorkspace>;

export function OrganizationNotifications({ workspace }: { workspace: Workspace }) {
  const { notifications } = workspace;

  return (
    <section className={cx('uni-view')}>
      <header className={cx('uni-page-title')}>
        <div>
          <span>NOTIFICATIONS</span>
          <h1>Notifications</h1>
          <p>Recent activity on your offers and student discovery.</p>
        </div>
      </header>

      {notifications.length ? (
        <section className={cx('uni-card', 'uni-activity')}>
          <header><div><span>ACTIVITY</span><h2>Latest updates</h2></div></header>
          {notifications.map(item => (
            <div key={item.id}>
              <span className={cx(item.tone)}>{item.icon}</span>
              <div><strong>{item.title}</strong><small>{item.detail}</small></div>
              <time>{item.when}</time>
            </div>
          ))}
        </section>
      ) : (
        <section className={cx('uni-card', 'empty-state')}>
          <strong>You&apos;re all caught up</strong>
          <p>New offer and student activity will appear here.</p>
        </section>
      )}
    </section>
  );
}
