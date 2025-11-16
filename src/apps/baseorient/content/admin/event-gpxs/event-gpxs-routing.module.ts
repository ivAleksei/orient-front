import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventGpxsPage } from './event-gpxs.page';

const routes: Routes = [
  {
    path: '',
    component: EventGpxsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventGpxsPageRoutingModule { }
