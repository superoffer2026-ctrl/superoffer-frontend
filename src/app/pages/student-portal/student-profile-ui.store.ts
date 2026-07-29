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
}
