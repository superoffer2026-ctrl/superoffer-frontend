import { Injectable } from '@angular/core';

const STORAGE_KEY = 'superoffer_student_profile_values';

const DEFAULT_VALUES: Record<string, string> = {
  fullName: 'Aarav Mehta',
  email: 'aarav@example.com',
  location: 'Bengaluru, India',
  qualification: 'B.Tech Computer Science',
  score: '8.7 / 10',
  fieldOfInterest: '',
  countries: '',
  intake: ''
};

function loadPersistedValues(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_VALUES, ...JSON.parse(raw) } : { ...DEFAULT_VALUES };
  } catch {
    return { ...DEFAULT_VALUES };
  }
}

function persistValues(values: Record<string, string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); } catch { /* storage unavailable */ }
}

/** Wrapping `values` in a Proxy means every `store.values[key] = x` write (ngModel bindings, saveAndContinue calls, etc.) survives a page reload without touching each call site. */
function createPersistedValues(): Record<string, string> {
  return new Proxy(loadPersistedValues(), {
    set(target, prop: string, value) {
      target[prop] = value;
      persistValues(target);
      return true;
    },
    deleteProperty(target, prop: string) {
      delete target[prop];
      persistValues(target);
      return true;
    }
  });
}

@Injectable({ providedIn: 'root' })
export class StudentProfileUiStore {
  values: Record<string, string> = createPersistedValues();
  photo = '';

  setFile(key: string, file?: File) {
    if (!file) return;
    this.values[key] = file.name;
    if (key !== 'photo') return;
    const reader = new FileReader();
    reader.onload = () => this.photo = String(reader.result || '');
    reader.readAsDataURL(file);
  }

  syncFromProfile(profile: any) {
    const values = this.values;
    if (profile?.basic) {
      values['fullName'] = profile.basic.fullName || [profile.basic.firstName, profile.basic.lastName].filter(Boolean).join(' ') || values['fullName'];
      values['email'] = profile.basic.email || values['email'];
      values['phone'] = profile.basic.mobile || values['phone'];
      values['location'] = profile.basic.country || values['location'];
    }
    Object.assign(values, profile?.academic || {}, profile?.tests || {}, profile?.skills || {}, profile?.achievements || {});
    if (profile?.preferences) {
      values['fieldOfInterest'] = profile.preferences.course || values['fieldOfInterest'];
      values['countries'] = Array.isArray(profile.preferences.countries) ? profile.preferences.countries.join(', ') : values['countries'];
      values['intake'] = Array.isArray(profile.preferences.intake) ? profile.preferences.intake.join(', ') : values['intake'];
    }
    if (profile?.studyLevel) values['studyLevel'] = profile.studyLevel;
  }
}
