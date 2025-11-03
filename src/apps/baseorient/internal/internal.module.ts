import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InternalPageRoutingModule } from './internal-routing.module';

import { InternalPage } from './internal.page';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from 'src/_shared/components/components.module';
import { PipesModule } from 'src/_shared/pipes/pipes.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    ComponentsModule,
    PipesModule,
    InternalPageRoutingModule
  ],
  declarations: [InternalPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InternalPageModule { }
