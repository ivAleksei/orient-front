import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventPcsPage } from './event-pcs.page';

const routes: Routes = [
  {
    path: '',
    component: EventPcsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventPcsPageRoutingModule { }
