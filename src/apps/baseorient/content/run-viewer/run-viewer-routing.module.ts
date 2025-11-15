import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RunViewerPage } from './run-viewer.page';

const routes: Routes = [
  {
    path: '',
    component: RunViewerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RunViewerPageRoutingModule { }
