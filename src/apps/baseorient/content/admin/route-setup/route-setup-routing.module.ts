import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RouteSetupPage } from './route-setup.page';

const routes: Routes = [
  {
    path: '',
    component: RouteSetupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RouteSetupPageRoutingModule { }
