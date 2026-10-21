import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/summaries/summaries.routes'),
  },
  { path: '**', redirectTo: '' },
];
