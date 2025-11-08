import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactsPageRoutingModule } from './contacts-routing.module';

import { ContactsPage } from './contacts.page';
import { ComponentsModule } from 'src/_shared/components/components.module';
import { PipesModule } from 'src/_shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule,
    ContactsPageRoutingModule
  ],
  declarations: [ContactsPage]
})
export class ContactsPageModule { }
