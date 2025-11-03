import { Pipe, PipeTransform } from "@angular/core";

/**
 * Recebe um valor e retorna o valor mascarado de acordo com o formato '999.999.999,99', com possibilidade de variação nos algarismos de precisão.
 */
@Pipe({
  name: "decimal",
})
export class DecimalPipe implements PipeTransform {
  /**
   * Recebe um valor e retorna o valor mascarado de acordo com o formato '999.999.999,99', com possibilidade de variação nos algarismos de precisão.
   * @param {string} value - Valor a mascarar. Todos os caracteres não dígitos são removidos para aplicação da máscara.
   * @param {string} precision - Valor de precisão. Por padrão, são utilizadas 2 casas decimais.
   */
  transform(value: any, precision?: number): string {
    if (value == null) return "-";

    if (typeof value != "number") value = Number(value);

    if (!value) {
      return "0.0";
    }

    let regex = new RegExp(`^-?\\d+(?:\\.\\d{0,${precision || 1}})?`);
    return (value.toString().match(regex) || [null])[0]
  }
}
