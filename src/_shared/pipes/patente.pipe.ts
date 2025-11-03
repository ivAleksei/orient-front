import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'patente'
})
export class PatentePipe implements PipeTransform {
  data: any = [
    { "id": "1", "forca_id": 0, "str_patentesigla": "CEL", "str_patente": "Coronel" },
    { "id": "2", "forca_id": 0, "str_patentesigla": "TC", "str_patente": "Tenente Coronel" },
    { "id": "3", "forca_id": 0, "str_patentesigla": "MAJ", "str_patente": "Major" },
    { "id": "4", "forca_id": 0, "str_patentesigla": "CAP", "str_patente": "Capitão" },
    { "id": "5", "forca_id": 0, "str_patentesigla": "1º TEN", "str_patente": "1º Tenente" },
    { "id": "6", "forca_id": 0, "str_patentesigla": "2º TEN", "str_patente": "2º Tenente" },
    { "id": "7", "forca_id": 0, "str_patentesigla": "ASP OF", "str_patente": "Aspirante à Oficial BM" },
    { "id": "8", "forca_id": 0, "str_patentesigla": "AL OF3", "str_patente": "Aluno Oficial de 3º Ano BM" },
    { "id": "9", "forca_id": 0, "str_patentesigla": "AL OF2", "str_patente": "Aluno Oficial de 2º Ano BM" },
    { "id": "10", "forca_id": 0, "str_patentesigla": "AL OF1", "str_patente": "Aluno Oficial de 1º Ano BM" },
    { "id": "11", "forca_id": 0, "str_patentesigla": "ST", "str_patente": "Sub Tenente BM" },
    { "id": "12", "forca_id": 0, "str_patentesigla": "1º SGT", "str_patente": "1º Sargento BM" },
    { "id": "13", "forca_id": 0, "str_patentesigla": "2º SGT", "str_patente": "2º Sargento BM" },
    { "id": "14", "forca_id": 0, "str_patentesigla": "3º SGT", "str_patente": "3º Sargento BM" },
    { "id": "15", "forca_id": 0, "str_patentesigla": "AL SGT", "str_patente": "Aluno Sargento BM" },
    { "id": "16", "forca_id": 0, "str_patentesigla": "CB", "str_patente": "Cabo BM" },
    { "id": "17", "forca_id": 0, "str_patentesigla": "SD", "str_patente": "Soldado BM" },
    { "id": "18", "forca_id": 0, "str_patentesigla": "AL SD", "str_patente": "Aluno Soldado BM" },
    { "id": "19", "forca_id": 1, "str_patentesigla": "CEL", "str_patente": "Coronel" },
    { "id": "20", "forca_id": 1, "str_patentesigla": "TC", "str_patente": "Tenente Coronel" },
    { "id": "21", "forca_id": 1, "str_patentesigla": "MAJ", "str_patente": "Major" },
    { "id": "22", "forca_id": 1, "str_patentesigla": "CAP", "str_patente": "Capitão" },
    { "id": "23", "forca_id": 1, "str_patentesigla": "1º TEN", "str_patente": "1º Tenente" },
    { "id": "24", "forca_id": 1, "str_patentesigla": "2º TEN", "str_patente": "2º Tenente" },
    { "id": "25", "forca_id": 1, "str_patentesigla": "ASP OF", "str_patente": "Aspirante à Oficial PM" },
    { "id": "26", "forca_id": 1, "str_patentesigla": "AL OF3", "str_patente": "Aluno Oficial de 3º Ano PM" },
    { "id": "27", "forca_id": 1, "str_patentesigla": "AL OF2", "str_patente": "Aluno Oficial de 2º Ano PM" },
    { "id": "28", "forca_id": 1, "str_patentesigla": "AL OF1", "str_patente": "Aluno Oficial de 1º Ano PM" },
    { "id": "29", "forca_id": 1, "str_patentesigla": "ST", "str_patente": "Sub Tenente PM" },
    { "id": "30", "forca_id": 1, "str_patentesigla": "1º SGT", "str_patente": "1º Sargento PM" },
    { "id": "31", "forca_id": 1, "str_patentesigla": "2º SGT", "str_patente": "2º Sargento PM" },
    { "id": "32", "forca_id": 1, "str_patentesigla": "3º SGT", "str_patente": "3º Sargento PM" },
    { "id": "33", "forca_id": 1, "str_patentesigla": "AL SGT", "str_patente": "Aluno Sargento PM" },
    { "id": "34", "forca_id": 1, "str_patentesigla": "CB", "str_patente": "Cabo PM" },
    { "id": "35", "forca_id": 1, "str_patentesigla": "SD", "str_patente": "Soldado PM" },
    { "id": "36", "forca_id": 1, "str_patentesigla": "AL SD", "str_patente": "Aluno Soldado PM" },
    { "id": "37", "forca_id": 2, "str_patentesigla": "CEL", "str_patente": "Coronel" },
    { "id": "38", "forca_id": 2, "str_patentesigla": "TC", "str_patente": "Tenente Coronel" },
    { "id": "39", "forca_id": 2, "str_patentesigla": "MAJ", "str_patente": "Major" },
    { "id": "40", "forca_id": 2, "str_patentesigla": "CAP", "str_patente": "Capitão" },
    { "id": "41", "forca_id": 2, "str_patentesigla": "1º TEN", "str_patente": "1º Tenente" },
    { "id": "42", "forca_id": 2, "str_patentesigla": "2º TEN", "str_patente": "2º Tenente" },
    { "id": "43", "forca_id": 2, "str_patentesigla": "ASP OF", "str_patente": "Aspirante à Oficial BM" },
    { "id": "44", "forca_id": 2, "str_patentesigla": "AL OF3", "str_patente": "Aluno Oficial de 3º Ano BM" },
    { "id": "45", "forca_id": 2, "str_patentesigla": "AL OF2", "str_patente": "Aluno Oficial de 2º Ano BM" },
    { "id": "46", "forca_id": 2, "str_patentesigla": "AL OF1", "str_patente": "Aluno Oficial de 1º Ano BM" },
    { "id": "47", "forca_id": 2, "str_patentesigla": "ST", "str_patente": "Sub Tenente BM" },
    { "id": "48", "forca_id": 2, "str_patentesigla": "1º SGT", "str_patente": "1º Sargento BM" },
    { "id": "49", "forca_id": 2, "str_patentesigla": "2º SGT", "str_patente": "2º Sargento BM" },
    { "id": "50", "forca_id": 2, "str_patentesigla": "3º SGT", "str_patente": "3º Sargento BM" },
    { "id": "51", "forca_id": 2, "str_patentesigla": "AL SGT", "str_patente": "Aluno Sargento BM" },
    { "id": "52", "forca_id": 2, "str_patentesigla": "CB", "str_patente": "Cabo BM" },
    { "id": "53", "forca_id": 2, "str_patentesigla": "SD", "str_patente": "Soldado BM" },
    { "id": "54", "forca_id": 2, "str_patentesigla": "AL SD", "str_patente": "Aluno Soldado BM" },

  ]

  transform(value: any, args?: any): string {
    let obj = (this.data || []).find(it => +it.id == +value)

    return obj ? obj[args?.short ? 'str_patentesigla' : 'str_patente'] : null;
  }

}
