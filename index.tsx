
import '@angular/compiler';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { AppComponent } from './src/app.component';
import { routes } from './src/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation()),
    importProvidersFrom(BrowserModule),
  ],
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
