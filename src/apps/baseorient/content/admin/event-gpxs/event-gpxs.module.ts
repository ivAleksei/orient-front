import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventGpxsPageRoutingModule } from './event-gpxs-routing.module';

import { EventGpxsPage } from './event-gpxs.page';
import { ComponentsModule } from 'src/_shared/components/components.module';
import { PipesModule } from 'src/_shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule,
    EventGpxsPageRoutingModule
  ],
  declarations: [EventGpxsPage]
})
export class EventGpxsPageModule { }
