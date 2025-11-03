import { Pipe, PipeTransform } from '@angular/core';
/**
 * Recebe um valor e retorna o valor mascarado de acordo com o formato definido.Com a possibilidade de mascaramento inverso.
 */
@Pipe({
  name: 'customFormat'
})
export class CustomFormatPipe implements PipeTransform {
  /**
   * Recebe um valor e retorna o valor mascarado de acordo com o formato definido. Com a possibilidade de mascaramento inverso.
   * @param {string} value - Número do documento como string.
   * @param {string} format - Formato desejado, por exemplo 'aaa-aaa', '9999.9.9-9', serão desprezados os caracteres dígitos e letras,
   *                          e mantidos apenas os caracteres especiais na posição determinada.
   * @param {boolean} reverse - Flag para preenchimento da máscara do fim ao início. Por padrão é definida false.
   */
  transform(value: any, format: any, reverse?: boolean): string {
    if (value) {
      switch (format) {
        case 'email':
          return value;
        case 'date':
          format = '99/99/9999'
          break;
        case 'time':
          format = '99:99:99'
          break;
        case 'date_time':
          format = '99/99/9999 99:99:99'
          break;
        case 'cep':
          format = '99999-999'
          break;
        case 'currency':
          format = '999.999.999,99'
          break;
        case 'milhar':
          format = '999.999.999.999'
          break;
        case 'phone':
        case 'cellphone':
        case 'phone_with_ddd':
        case 'cellphone_with_ddd':
          let n_digits = String(value).replace(/\D/g, '').length;
          switch (n_digits) {
            case 8:
              format = '9999-9999'
              break;
            case 9:
              format = '99999-9999'
              break;
            case 10:
              format = '(99) 9999-9999'
              break;
            case 11:
              format = '(99) 99999-9999'
              break;
            case 13:
              format = '+99 (99) 99999-9999'
              break;
          }
          break;
        case 'cpf':
          format = '999.999.999-99'
          break;
        case 'cnpj':
          format = '99.999.999/9999-99'
          break;
        case 'bank-account':
          format = '99.999-9'
          break;
        case 'agency':
          format = '999999-9'
          break;
        case 'numProcesso':
          format = '999999'
          break;
        case 'numRecibo':
          format = '9999999'
          break;
        case 'ano':
          format = '9999'
          break;
        case 'pis_pasep':
          format = '999.99999.99-9'
          reverse= true;
          break;
        default:
          format = format;
          break;
      };
      if (reverse) {
        value = String(value).split("").reverse().join("").trim();
        format = String(format).split("").reverse().join("").trim();
      }

      let regex = /[\w\*]/g;
      value = (value.match(regex) || []).join('');
      let rawValue = '';
      regex = /\w/;

      let i = 0;
      value = value.trim();
      for (let c in format) {
        if ((c < (format.length)) && value[i])
          if (regex.test(format[c])) {
            rawValue += value[i]
            i++;
          } else {
            rawValue += format[c];
          }
      }
      if (reverse) {
        rawValue = rawValue.split("").reverse().join("").trim();
      }
      return rawValue;
    } else {
      return '-';
    }
  }

}
