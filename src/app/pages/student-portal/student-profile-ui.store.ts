import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StudentProfileUiStore {
  values: Record<string, string> = {
    fullName: 'Aarav Mehta',
    email: 'aarav@example.com',
    location: 'Bengaluru, India',
    qualification: 'B.Tech Computer Science',
    score: '8.7 / 10',
    fieldOfInterest: 'Data Science',
    countries: 'Canada, United Kingdom',
    intake: 'Fall 2027'
  };
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
