import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency'
})
export class CurrencyPipe implements PipeTransform {

  transform(value: any, options?: any): any {
    if (options === true) options = { symbol: true };
    if (!options) options = {};
    if (value == null || value == '-') {
      value = '0';
    }

    if (typeof value == "string") value = value.replace(",", ".");

    if (typeof value != "number") value = Number(value);

    let rawValue = String(value.toFixed(2)).replace(/\D/g, "");

    return (options.symbol ? 'R$ ' : '') +
      (value < 0 ? "- " : "") +
      (parseInt(rawValue) / 100).toLocaleString("de-DE", {
        minimumFractionDigits: (options.decimals || 2),
        maximumFractionDigits: (options.decimals || 2)
      }).trim();
  }

}
