import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClubsPage } from './clubs.page';

const routes: Routes = [
  {
    path: '',
    component: ClubsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClubsPageRoutingModule { }
