import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FederationDetailsPageRoutingModule } from './federation-details-routing.module';

import { FederationDetailsPage } from './federation-details.page';
import { ComponentsModule } from 'src/_shared/components/components.module';
import { PipesModule } from 'src/_shared/pipes/pipes.module';
import { FederationFormPageModule } from '../federation-form/federation-form.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule,
    FederationFormPageModule,
    FederationDetailsPageRoutingModule
  ],
  declarations: [FederationDetailsPage]
})
export class FederationDetailsPageModule { }
