import { Component, Input, OnInit } from '@angular/core';
import { TAFService } from 'src/apps/sisbom_web/_shared/providers/taf.service';
import { v1 as uuid } from 'uuid';

@Component({
  selector: 'app-wid-taf-indices',
  templateUrl: './wid-taf-indices.component.html',
  styleUrls: ['./wid-taf-indices.component.scss'],
})
export class WidTafIndicesComponent implements OnInit {
  id: any;
  subResize: any;
  tafIndices: any;

  constructor(
    private tafService: TAFService
  ) {
    this.id = uuid();
  }

  ngOnInit() {
    this.setup();
  }

  ngOnDestroy() {
    $('body').off('resize');
  }


  async setup() {
    this.getDataTabela();
  }

  async getDataTabela() {
    let data = await this.tafService.getTafTabela();
    this.tafIndices = data || null;
  }

  descontoIndice(tempo) {
    let split = tempo.split(':');
    let time = ((+split[0] || 0) * 60) + (+split[1] || 0);
    time--;
    let min = Math.floor(time / 60);
    return [min, ('00' + (time - (min * 60))).slice(-2)].join(':');
  }

}
