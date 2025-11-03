import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CurrencyPipe } from './currency.pipe';
import { CustomFormatPipe } from './custom-format.pipe';
import { DatePipe } from './date.pipe';
import { DecimalPipe } from './decimal.pipe';
import { EllipsisPipe } from './ellipsis.pipe';
import { ObjKeyPipe } from './obj-key.pipe';
import { QraPipe } from './qra.pipe';
import { StatusPipe } from './status.pipe';
import { BgNumPipe } from './bg_num.pipe';
import { SizePipe } from './size.pipe';
import { PatentePipe } from './patente.pipe';
import { TimePipe } from './time.pipe';



@NgModule({
  declarations: [
    CurrencyPipe,
    CustomFormatPipe,
    DatePipe,
    DecimalPipe,
    EllipsisPipe,
    ObjKeyPipe,
    QraPipe,
    BgNumPipe,
    StatusPipe,
    PatentePipe,
    SizePipe,
    TimePipe,
  ],
  imports: [
    CommonModule
  ],
  providers: [
    CurrencyPipe,
    CustomFormatPipe,
    DatePipe,
    BgNumPipe,
    PatentePipe,
    DecimalPipe,
    EllipsisPipe,
    ObjKeyPipe,
    QraPipe,
    StatusPipe,
    SizePipe,
    TimePipe,
  ],
  exports: [
    CurrencyPipe,
    CustomFormatPipe,
    DatePipe,
    DecimalPipe,
    EllipsisPipe,
    BgNumPipe,
    SizePipe,
    ObjKeyPipe,
    TimePipe,
    QraPipe,
    StatusPipe,
  ],
})
export class PipesModule { }
