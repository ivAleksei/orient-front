import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InternalPage } from './internal.page';

const routes: Routes = [
  {
    path: '',
    component: InternalPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('src/apps/baseorient/content/home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('src/apps/baseorient/content/admin/admin.module').then(m => m.AdminModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternalPageRoutingModule { }
