import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Header],
  template: `
  <div class="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
    <app-sidebar />
    <div class="flex flex-col flex-1 overflow-hidden">
      <app-header />
      <main class="flex-1 overflow-y-auto p-8">
        <router-outlet />
      </main>
    </div>
  </div>`,
})
export class Layout { }
