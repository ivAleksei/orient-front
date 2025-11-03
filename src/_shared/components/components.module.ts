import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from './data-table/data-table.component';
import { DataTablesModule } from 'angular-datatables';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FloatingButtonsComponent } from './floating-buttons/floating-buttons.component';
import { LoadingComponent } from './loading/loading.component';
import { FilterByComponent } from './filter-by/filter-by.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { QRCodeModule } from 'angularx-qrcode';
import { SummernoteComponent } from './summernote/summernote.component';
import { UploadsComponent } from './uploads/uploads.component';
import { WidWheatherComponent } from './wid-wheather/wid-wheather.component';
import { WidTabuaMareComponent } from './wid-tabua-mare/wid-tabua-mare.component';
import { PipesModule } from '../pipes/pipes.module';
import { WidTafIndicesComponent } from './wid-taf-indices/wid-taf-indices.component';




@NgModule({
  declarations: [
    DataTableComponent,
    AutocompleteComponent,
    FloatingButtonsComponent,
    LoadingComponent,
    FilterByComponent,
    SummernoteComponent,
    UploadsComponent,
    WidTafIndicesComponent,
    WidWheatherComponent,
    WidTabuaMareComponent,
  ],
  imports: [
    IonicModule,
    FormsModule,
    CommonModule,
    PipesModule,
    DataTablesModule,
    QRCodeModule,
    NgxChartsModule,
    FullCalendarModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  exports: [
    SummernoteComponent,
    QRCodeModule,
    DataTableComponent,
    AutocompleteComponent,
    FloatingButtonsComponent,
    LoadingComponent,
    DataTablesModule,
    FullCalendarModule,
    NgxChartsModule,
    FilterByComponent,
    UploadsComponent,
    WidWheatherComponent,
    WidTafIndicesComponent,
    WidTabuaMareComponent,
  ]
})
export class ComponentsModule { }
