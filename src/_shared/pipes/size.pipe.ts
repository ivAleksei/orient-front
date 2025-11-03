import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'size'
})
export class SizePipe implements PipeTransform {
  constructor() { }

  transform(value: any, args?: any): any {
    if (!value) return '-';

    if (!args) args = 'MB';

    let map = {
      MB: () => {
        return +(value / 1000000).toFixed(2);
      }
    };

    if (!map[args]) return value;

    let new_val = map[args]();

    return [new_val, args].join(' ');
  }

}
