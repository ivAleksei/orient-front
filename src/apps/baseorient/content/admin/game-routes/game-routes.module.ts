import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GameRoutesPageRoutingModule } from './game-routes-routing.module';

import { GameRoutesPage } from './game-routes.page';
import { ComponentsModule } from 'src/_shared/components/components.module';
import { PipesModule } from 'src/_shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule,
    GameRoutesPageRoutingModule
  ],
  declarations: [GameRoutesPage]
})
export class GameRoutesPageModule { }
