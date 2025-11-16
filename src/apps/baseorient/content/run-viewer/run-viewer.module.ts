import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { RunViewerPage } from './run-viewer.page';
import { ComponentsModule } from 'src/_shared/components/components.module';
import { PipesModule } from 'src/_shared/pipes/pipes.module';
import { RunViewerPageRoutingModule } from './run-viewer-routing.module';
import { DirectivesModule } from 'src/_shared/directives/directives.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule,
    DirectivesModule,
    RunViewerPageRoutingModule
  ],
  declarations: [RunViewerPage],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RunViewerPageModule { }
