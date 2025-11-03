import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputMaskDirective } from './input-mask.directive';
import { UiSortableDirective } from './ui-sortable.directive';
import { HasPermissionDirective } from './has-permission';

@NgModule({
  declarations: [
    InputMaskDirective,
    HasPermissionDirective,
    UiSortableDirective,
  ],
  imports: [
    CommonModule,
  ],
  providers: [],
  exports: [
    UiSortableDirective,
    HasPermissionDirective,
    InputMaskDirective
  ]
})
export class DirectivesModule { }
