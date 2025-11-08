import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClubDetailsPageRoutingModule } from './club-details-routing.module';

import { ClubDetailsPage } from './club-details.page';
import { ComponentsModule } from 'src/_shared/components/components.module';
import { PipesModule } from 'src/_shared/pipes/pipes.module';
import { ClubFormPageModule } from '../club-form/club-form.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule,
    ClubFormPageModule,
    ClubDetailsPageRoutingModule
  ],
  declarations: [ClubDetailsPage]
})
export class ClubDetailsPageModule { }
