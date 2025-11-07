import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfederationsPage } from './confederations.page';

const routes: Routes = [
  {
    path: '',
    component: ConfederationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfederationsPageRoutingModule { }
