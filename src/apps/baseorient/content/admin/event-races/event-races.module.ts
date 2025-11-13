import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventRacesPageRoutingModule } from './event-races-routing.module';

import { EventRacesPage } from './event-races.page';
import { ComponentsModule } from 'src/_shared/components/components.module';
import { PipesModule } from 'src/_shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule,
    EventRacesPageRoutingModule
  ],
  declarations: [EventRacesPage]
})
export class EventRacesPageModule { }
