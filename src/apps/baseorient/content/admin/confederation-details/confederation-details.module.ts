import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfederationDetailsPageRoutingModule } from './confederation-details-routing.module';

import { ConfederationDetailsPage } from './confederation-details.page';
import { ComponentsModule } from 'src/_shared/components/components.module';
import { PipesModule } from 'src/_shared/pipes/pipes.module';
import { ConfederationFormPageModule } from '../confederation-form/confederation-form.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule,
    ConfederationFormPageModule,
    ConfederationDetailsPageRoutingModule
  ],
  declarations: [ConfederationDetailsPage]
})
export class ConfederationDetailsPageModule { }
