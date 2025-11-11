import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'result/:id',
    loadChildren: () => import('src/apps/baseorient/content/admin/result-detail/result-detail.module').then(m => m.ResultDetailPageModule)
  },
  {
    path: 'start',
    loadChildren: () => import('src/_shared/pages/start/start.module').then(m => m.StartPageModule)
  },
  {
    path: 'welcome',
    loadChildren: () => import('src/_shared/pages/welcome/welcome.module').then(m => m.WelcomePageModule)
  },
  {
    path: 'internal',
    loadChildren: () => import('./internal/internal.module').then(m => m.InternalPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  { path: '', redirectTo: '/start', pathMatch: "full" },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
