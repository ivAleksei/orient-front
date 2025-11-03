import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment";

/**
 * Recebe um valor e retorna o valor mascarado de acordo com o formato definido. Por padrão, utiliza-se o formato 'DD/MM/YYYY'.
 */
@Pipe({
  name: "date",
})
export class DatePipe implements PipeTransform {
  formats: any = [
    moment.ISO_8601,
    "MM-DD",
    "HH:mm",
    "MM/YYYY",
    "YYYY-MM",
    "YYYY-MM-DD",
    "DD/MM/YYYY",
    "DD MMM YYYY",
    "x",
    "w",
    "M",
    "YYYY-MM-DD HH:mm:ss"
  ]
  /**
   * Recebe um valor e retorna o valor mascarado de acordo com o formato definido. Por padrão, utiliza-se o formato 'DD/MM/YYYY'.
   * @param {any} value - Data no formato ISO_8601: ["2013-02-08", "2013-02-08T09", "2013-02-08 09", "2013-02-08 09:30", "2013-02-08 09:30:26", "2013-02-08 09:30:26.123", "2013-02-08 24:00:00.000"].
   * @param {string} format - Formato de saída estruturado de acordo com o framework Moment.js (https://momentjs.com/docs/#/displaying/format/).
   */
  transform(value: any, formatTo?: string, formatFrom?: string): string {
    if (value && value.seconds) {
      value = `${value.seconds}000`;
    }
    let input_formats = this.formats;
    if (moment(value, formatFrom || input_formats).isValid()) {
      let date = moment(value, formatFrom || input_formats);

      if (!formatTo || !formatTo.includes('diff'))
        return date.format(formatTo || "DD/MM/YYYY");

      let now = moment();

      if (formatTo == 'diff') {
        let diff = Math.floor(now.diff(date, 'seconds'));
        if (diff < 0) return 'Data futura';

        let years = now.diff(date, 'years');
        if (years > 0) return `${years} ano${years > 1 ? "s" : ''} atrás`;

        let months = now.diff(date, 'months');
        if (months > 0) return `${months} mes${months > 1 ? "es" : ''} atrás`;

        let days = now.diff(date, 'days');
        if (days > 0) return `${days} dia${days > 1 ? "s" : ''} atrás`;

        let hours = now.diff(date, 'hours');
        if (hours > 0) return `${hours} hora${hours > 1 ? "s" : ''} atrás`;

        let minutes = now.diff(date, 'minutes');
        if (minutes > 0) return `${minutes} minuto${minutes > 1 ? "s" : ''} atrás`;

        let seconds = now.diff(date, 'seconds');
        if (seconds > 0) return `Alguns segundos atrás`;
      }

      if (formatTo == 'diff_ext') {
        date = date.startOf('day');
        now = now.endOf('day');

        let years = now.diff(date, 'years');
        date = date.add(years, 'years');
        let months = now.diff(date, 'months');
        date = date.add(months, 'months');
        let days = now.diff(date, 'days');;

        return [years, 'ano(s)', months, 'mes(es)', days, 'dia(s)'].join(' ');
      }


    } else return "-";
  }
}