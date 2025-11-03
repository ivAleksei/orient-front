import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UploadsPage } from './uploads.page';

const routes: Routes = [
  {
    path: 'saude-evolucao/:id',
    component: UploadsPage
  },
  {
    path: 'hidrantes/:id',
    component: UploadsPage
  },
  {
    path: '**',
    redirectTo: '/internal/home'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UploadsPageRoutingModule { }
