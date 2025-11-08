import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfederationDetailsPage } from './confederation-details.page';

const routes: Routes = [
  {
    path: '',
    component: ConfederationDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfederationDetailsPageRoutingModule { }
