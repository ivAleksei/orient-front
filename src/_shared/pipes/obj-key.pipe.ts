import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objKey'
})
export class ObjKeyPipe implements PipeTransform {
  constructor() { }

  transform(value: string, args: any, key?: any): any {
    if (args && args[value]) {
      if (key) return args[value][key];
      return args.value;
    }

    return null;
  }

}
