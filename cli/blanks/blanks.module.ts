import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BlanksPageRoutingModule } from './blanks-routing.module';

import { BlanksPage } from './blanks.page';
import { ComponentsModule } from 'src/_shared/components/components.module';
import { PipesModule } from 'src/_shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule,
    BlanksPageRoutingModule
  ],
  declarations: [BlanksPage]
})
export class BlanksPageModule { }
