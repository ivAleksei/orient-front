import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'qra'
})
export class QraPipe implements PipeTransform {

  transform(name: string, qra?: string): string {
    return name.split(' ').map(s => {
      let split = qra.split(' ').map(q => q.replace(/\W/g, ''));

      if (split.includes(s.replace(/\W/g, '').toLocaleUpperCase()))
        return s.toLocaleUpperCase();

      return s;
    }).join(' ');
  }

}
