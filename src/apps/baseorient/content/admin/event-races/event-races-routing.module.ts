import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventRacesPage } from './event-races.page';

const routes: Routes = [
  {
    path: '',
    component: EventRacesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventRacesPageRoutingModule { }
