import { Pipe, PipeTransform } from "@angular/core";
import * as extenso from "extenso";

/**
 * Recebe um valor e retorna o valor mascarado de acordo com o formato definido. Por padrão, utiliza-se o formato 'DD/MM/YYYY'.
 */
@Pipe({
  name: "numeral_ext",
})
export class NumeralExtPipe implements PipeTransform {

  /**
   * Recebe um valor e retorna o valor mascarado de acordo com o formato definido. Por padrão, utiliza-se o formato 'DD/MM/YYYY'.
   * @param {any} value - Data no formato ISO_8601: ["2013-02-08", "2013-02-08T09", "2013-02-08 09", "2013-02-08 09:30", "2013-02-08 09:30:26", "2013-02-08 09:30:26.123", "2013-02-08 24:00:00.000"].
   * @param {string} format - Formato de saída estruturado de acordo com o framework Moment.js (https://momentjs.com/docs/#/displaying/format/).
   */
  transform(value: any, format?: string): string {
    if (!value && String(value) != '0') return;
    return extenso(String(value), format || null);
  }
}