import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'uploads',
    loadChildren: () => import('src/_shared/pages/uploads/uploads.module').then(m => m.UploadsPageModule)
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
  {
    path: 'extras',
    loadChildren: () => import('./content/extras/extras.module').then(m => m.ExtrasModule)
  },
  {
    path: 'credits',
    loadChildren: () => import('./content/credits/credits.module').then(m => m.CreditsPageModule)
  },
  {
    path: 'acesso-publico',
    loadChildren: () => import('./content/acesso-publico/acesso-publico.module').then(m => m.AcessoPublicoModule)
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
