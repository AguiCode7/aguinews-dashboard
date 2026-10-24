import { Routes } from '@angular/router';

// Cada página se carga de forma diferida.
export const routes: Routes = [
  {
    path: '',
    title: 'AguiNews · Edición de hoy',
    loadComponent: () =>
      import('./features/news/edition-page/edition-page').then(
        (m) => m.EditionPage,
      ),
  },
  {
    path: 'editions/:id',
    title: 'AguiNews · Edición',
    loadComponent: () =>
      import('./features/news/edition-page/edition-page').then(
        (m) => m.EditionPage,
      ),
  },
  {
    path: 'articles/:id',
    title: 'AguiNews · Lectura',
    loadComponent: () =>
      import('./features/news/reader-page/reader-page').then(
        (m) => m.ReaderPage,
      ),
  },
  {
    path: 'archive',
    title: 'AguiNews · Archivo',
    loadComponent: () =>
      import('./features/news/archive-page/archive-page').then(
        (m) => m.ArchivePage,
      ),
  },
  {
    path: 'saved',
    title: 'AguiNews · Guardadas',
    loadComponent: () =>
      import('./features/news/saved-page/saved-page').then((m) => m.SavedPage),
  },
  { path: '**', redirectTo: '' },
];
