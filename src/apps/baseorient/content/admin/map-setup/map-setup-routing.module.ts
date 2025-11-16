import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapSetupPage } from './map-setup.page';

const routes: Routes = [
  {
    path: '',
    component: MapSetupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapSetupPageRoutingModule { }
