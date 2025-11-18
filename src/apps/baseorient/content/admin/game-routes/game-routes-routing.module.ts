import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GameRoutesPage } from './game-routes.page';

const routes: Routes = [
  {
    path: '',
    component: GameRoutesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameRoutesPageRoutingModule { }
