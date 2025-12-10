import '@angular/compiler';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // <--- ۱. این خط حیاتی است

import { AppComponent } from './src/app.component';
import { routes } from './src/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(), // <--- ۲. این خط اجازه اتصال به بک‌اند را می‌دهد
    importProvidersFrom(BrowserModule),
  ],
}).catch(err => console.error(err));