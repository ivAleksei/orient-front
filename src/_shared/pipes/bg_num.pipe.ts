import { Pipe, PipeTransform } from "@angular/core";

/**
 * Recebe uma string e retorna o valor mascarado de acordo com o formato.
 */
@Pipe({
  name: "bg_num",
})
export class BgNumPipe implements PipeTransform {
  transform(value: any, prop?: string): string {

    if (prop) {
      let params = ['/', '_'];
      if (prop == 'bg_num')
        params = ['_', '/'];

      return (value || '').split(params[0]).reverse().join(params[1]);
    }

    return '';
  }
}
