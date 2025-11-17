import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouteSetupPageRoutingModule } from './route-setup-routing.module';

import { RouteSetupPage } from './route-setup.page';
import { ComponentsModule } from 'src/_shared/components/components.module';
import { PipesModule } from 'src/_shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule,
    RouteSetupPageRoutingModule
  ],
  declarations: [RouteSetupPage]
})
export class RouteSetupPageModule { }
