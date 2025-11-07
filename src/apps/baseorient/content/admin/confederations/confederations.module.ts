import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfederationsPageRoutingModule } from './confederations-routing.module';

import { ConfederationsPage } from './confederations.page';
import { ComponentsModule } from 'src/_shared/components/components.module';
import { PipesModule } from 'src/_shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule,
    ConfederationsPageRoutingModule
  ],
  declarations: [ConfederationsPage]
})
export class ConfederationsPageModule { }
