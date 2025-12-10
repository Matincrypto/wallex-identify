
import { Routes } from '@angular/router';
import { VerificationFlowComponent } from './verification-flow.component';
import { AdminComponent } from './admin.component';

export const routes: Routes = [
  { path: '', component: VerificationFlowComponent, title: 'Wallex Verification Form' },
  { path: 'admin', component: AdminComponent, title: 'Admin Panel' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
