import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(value: any): string {
    value = +value;
    if (!value) return '-';

    let minutos = Math.floor((value % 3600) / 60);
    let segundos = value % 60;

    return [('00' + minutos).slice(-2), ('00' + segundos).slice(-2)].join(':');
  }

}
