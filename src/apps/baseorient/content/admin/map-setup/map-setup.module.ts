import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapSetupPageRoutingModule } from './map-setup-routing.module';

import { MapSetupPage } from './map-setup.page';
import { ComponentsModule } from 'src/_shared/components/components.module';
import { PipesModule } from 'src/_shared/pipes/pipes.module';
import { DirectivesModule } from 'src/_shared/directives/directives.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule,
    DirectivesModule,
    MapSetupPageRoutingModule
  ],
  declarations: [MapSetupPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapSetupPageModule { }
