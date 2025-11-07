import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FederationsPage } from './federations.page';

const routes: Routes = [
  {
    path: '',
    component: FederationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FederationsPageRoutingModule { }
