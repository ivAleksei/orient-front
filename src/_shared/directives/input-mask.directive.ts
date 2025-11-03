import { Directive, ElementRef, Input, HostListener } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import * as moment from "moment";
import * as $ from 'jquery';

@Directive({
  selector: "[data-mask]",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputMaskDirective,
      multi: true,
    },
  ],
})
export class InputMaskDirective implements ControlValueAccessor {
  constructor(
    private el: ElementRef
  ) { }

  @Input() mask: any;
  elem: any = this.el.nativeElement;
  data_mask: any;
  reverse: any;

  onTouched: any = (event) => { };
  onChange: any = (event) => { };

  ngAfterViewInit() {
    this.data_mask = $(this.elem).attr("data-mask");
    this.reverse = $(this.elem).attr("reverse");
    this.mask = this.getPattern();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;

  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  @HostListener("keyup", ["$event"])
  onKeyup(ev: any) {
    // console.log('onKeyup', ev.keyCode);
    let valor = ev.target.value.replace(/\D/g, "");
    this.handleValue(valor, ev);
  }

  writeValue(value: any) {
    if (value && this.data_mask == 'decimal') {
      value = value.toFixed(1);
    }
    if (value && this.data_mask == 'currency') {
      value = value.toFixed(2);
    }
    this.handleValue(String(value).replace(/\D/g, ''));
  }

  handleValue(valor: any, ev?: any) {
    if (valor) {


      let pad = this.mask.replace(/\D/g, "").replace(/9/g, "_");

      // LIMITA O TAMANHO DE CARACTERES
      if (valor.length <= pad.length) {
        this.setModelValue(valor);
      }

      // SE BACKSPACE NÃO LIDA COM VALOR MASCARADO
      if (ev?.keyCode === 8) return;


      let reverse = this.reverse || false;
      let valorMask = valor + pad.substring(0, pad.length - valor.length);

      // MONTA EXIBIÇÃO DE ACORDO COM A MÁSCARA
      if (this.data_mask == 'decimal' || this.data_mask == 'currency' || this.data_mask == 'milhar')
        reverse = true;

      if (reverse) {
        valorMask = pad.substring(0, pad.length - valor.length) + valor;
      }

      let format = this.mask;
      let value = valorMask;

      if (value) {
        let rawValue = "";
        let regex = /\w/;
        let i = 0;
        value = value.trim();
        for (let c in format) {
          if (c < format.length && value[i])
            if (regex.test(format[c])) {
              rawValue += value[i];
              i++;
            } else {
              rawValue += format[c];
            }
        }

        if (reverse) {
          rawValue = rawValue.substring(rawValue.indexOf(valor[0]));
        }

        if (rawValue.indexOf("_") > -1) {
          rawValue = rawValue.substr(0, rawValue.indexOf("_"));
        }
        valor = rawValue;
      }
    } else {
      valor = "";
      this.setModelValue("");
    }

    // SETA VALOR DO OBJETO HTML
    if (ev) {
      ev.target.value = valor;
    } else {
      this.el.nativeElement.value = valor;
    }

  }

  setModelValue(valor: any) {
    let new_value = valor;
    if (this.data_mask == 'decimal') {
      new_value = +(valor.replace(/\D/g, "")) / 10;
    } else if (this.data_mask == 'currency') {
      new_value = +(valor.replace(/\D/g, "")) / 100;
    } else if (this.data_mask == 'time') {
      if (valor.length < 2) {
        new_value = '';
      } else {
        if (valor.length == 2 || valor.length == 4)
          new_value = moment(valor, "HH:mm").format();
      }
    } else if (this.data_mask == 'date') {
      if (valor.length < 2) {
        new_value = '';
      } else {
        if (valor.length == 2 || valor.length == 5 || valor.length == 10)
          new_value = moment(valor, "DD/MM/YYYY").format();
      }
    } else {
      new_value = valor.replace(/\D/g, "");
    }
    // console.log('setModelValue', valor, new_value);
    this.onChange(new_value);
  }

  getPattern(pattern?: string): string {
    // console.log('getPattern', pattern);

    let mask = pattern || this.data_mask;

    switch (mask) {
      case "date":
        return "99/99/9999";
      case "time":
        return "99:99:99";
      case "date_time":
        return "99/99/9999 99:99:99";
      case "cep":
        return "99999-999";
      case "decimal":
        return "999.999.999,9";
      case "currency":
        return "999.999.999,99";
      case "milhar":
        return "999.999.999.999";
      case "phone":
        return "9999-9999";
      case "cellphone":
        return "99999-9999";
      case "phone_with_ddd":
        return "(99) 9999-9999";
      case "cellphone_with_ddd":
        return "(99) 99999-9999";
      case "global_phone":
        return "+99 (99) 9999-9999";
      case "cpf":
        return "999.999.999-99";
      case "cnpj":
        return "99.999.999/9999-99";
      case "bank-account":
        return "99.999-9";
      case "agency":
        return "999999-9";
      case "numProcesso":
        return "999999";
      case "numRecibo":
        return "9999999";
      case "ano":
        return "9999";
      default:
        return this.data_mask;
    }
  }
}
