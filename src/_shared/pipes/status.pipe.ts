import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {

  constructor() { }

  transform(value: string, prop?: string): unknown {
    let map_status = {
      "MissingPunch": {
        class: "warning",
        label: "NCL"
      },
      "DidNotFinish": {
        class: "warning",
        label: "DNF"
      },
      "DidNotStarted": {
        class: "warning",
        label: "DNS"
      },
      "aprovado": {
        class: "success",
        label: "Aprovado"
      },
      "aprovado_parcial": {
        class: "warning",
        label: "Aprovado Parcial"
      },
      "negado": {
        class: "danger",
        label: "Negado"
      },
      "denied": {
        class: "danger",
        label: "Negado"
      },
      "success": {
        class: "success",
        label: "Aprovado"
      },
      "draw": {
        class: "medium",
        label: "Rascunho"
      },
      "waiting": {
        class: "warning",
        label: "Aguardando"
      },
      "showing": {
        class: "success",
        label: "Em Exibição"
      },
      "expired": {
        class: "danger",
        label: "Expirado"
      },
      "aproved": {
        class: "success",
        label: "Aprovado"
      },
      "nao_conformidade": {
        class: "warning",
        label: "Não Conformidade"
      },
      "em_conformidade": {
        class: "success",
        label: "Em Conformidade"
      },
      "EXCEPCIONAL": {
        class: "success",
        label: "Excepcional"
      },
      "sugestao": {
        class: "medium",
        label: "Sugestão"
      },
      "ÓTIMO": {
        class: "warning",
        label: "Ótimo"
      },
      "MUITO BOM": {
        class: "info",
        label: "Muito Bom"
      },
      "BOM": {
        class: "medium",
        label: "Bom"
      },
      "INSUFICIENTE": {
        class: "dark",
        label: "Insuficiente"
      },
      "MAU": {
        class: "danger",
        label: "Mau"
      },
      "novo": {
        class: "light",
        label: "Novo"
      },
      "processando": {
        class: "info",
        label: "Processando"
      },
      "pendente": {
        class: "warning",
        label: "Pendente"
      },
      "solucionado": {
        class: "success",
        label: "Solucionado"
      },
      "nao_solucionado": {
        class: "medium",
        label: "Não Solucionado"
      },
      "fechado": {
        class: "dark",
        label: "Fechado"
      },
      "active": {
        class: "info",
        label: "Ativo"
      },
      "medic": {
        class: "danger",
        label: "Junta Médica"
      },
      "others": {
        class: "warning",
        label: "Outros"
      },
      'pos': {
        class: 'success',
        label: 'Positivo'
      },
      'done': {
        class: 'success',
        label: 'Concluído'
      },
      'positive': {
        class: 'success',
        label: 'Positivo'
      },
      'neg': {
        class: 'danger',
        label: 'Negativo'
      },
      'negative': {
        class: 'danger',
        label: 'Negativo'
      },
      'to_confirm': {
        class: 'danger',
        label: 'A confirmar'
      },
      'sent': {
        class: 'medium',
        label: 'Enviado'
      },
      'not_justified': {
        class: 'danger',
        label: 'Não Justificado'
      },
      'justified': {
        class: 'success',
        label: 'Justificado'
      },
      'aware': {
        class: 'info',
        label: 'Ciente'
      },
      'wait_review': {
        class: 'warning',
        label: 'Ag. Parecer'
      },
      'confirmed': {
        class: 'success',
        label: 'Confirmado'
      },
      'error': {
        class: 'danger',
        label: 'Erro'
      },
      'pending': {
        class: 'warning',
        label: 'Pendente'
      },
      'canceled': {
        class: 'danger',
        label: 'Cancelado'
      },
      'ready': {
        class: 'success',
        label: 'Pronto'
      },
      'accepted': {
        class: 'success',
        label: 'Aceito'
      },
      'deniednegado': {
        class: 'danger',
        label: 'Negado'
      },
      'delivered': {
        class: 'info',
        label: 'Entregue'
      },
      'true': {
        class: 'success',
        label: 'Ativo'
      },
      'false': {
        class: 'light',
        label: 'Inativo'
      }
    };
    let obj = map_status[value];
    if (!obj) return value;

    return obj[prop || 'label'];
  }

}
