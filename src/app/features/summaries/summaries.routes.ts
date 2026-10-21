import { Routes } from '@angular/router';

// Rutas de las ediciones (cada página se carga de forma diferida).
export default [
  {
    path: '',
    title: 'AguiNews',
    loadComponent: () =>
      import('./edition-list/edition-list').then((m) => m.EditionList),
  },
  {
    path: 'editions/:id',
    title: 'AguiNews · Edición',
    loadComponent: () =>
      import('./edition-detail/edition-detail').then((m) => m.EditionDetail),
  },
] satisfies Routes;
