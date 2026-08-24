'use client';

import { useSyncExternalStore } from 'react';

/**
 * Angular's zone.js re-rendered every view after a store mutation. React needs
 * that signal to be explicit, so each ported singleton store extends this base
 * and calls `emit()` whenever its state changes.
 */
export class ObservableStore {
  private listeners = new Set<() => void>();
  private version = 0;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): number => this.version;

  protected emit(): void {
    this.version += 1;
    this.listeners.forEach(listener => listener());
  }
}

/**
 * Subscribes a component to a store and returns it. The snapshot is a version
 * counter rather than the state itself, because these stores are mutable
 * singletons carried over from the Angular app.
 */
export function useStore<T extends ObservableStore>(store: T): T {
  useSyncExternalStore(store.subscribe, store.getSnapshot, () => 0);
  return store;
}
