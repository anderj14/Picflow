import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'picflow-theme';

  isDark = signal<boolean>(this.loadPreference());

  constructor() {
    this.applyTheme(this.isDark());
  }

  toggle() {
    const next = !this.isDark();
    this.isDark.set(next);
    this.applyTheme(next);
    localStorage.setItem(this.STORAGE_KEY, next ? 'dark' : 'light');
  }

  private loadPreference(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(dark: boolean) {
    document.documentElement.classList.toggle('dark', dark);
  }
}
