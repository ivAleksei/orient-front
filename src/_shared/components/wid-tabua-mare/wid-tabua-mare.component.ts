import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Color, ScaleType, NgxChartsModule } from '@swimlane/ngx-charts';
import moment from 'moment';
import { TideService } from 'src/_shared/services/tide.service';
import { curveMonotoneX } from 'd3-shape';


@Component({
  selector: 'app-wid-tabua-mare',
  templateUrl: './wid-tabua-mare.component.html',
  styleUrls: ['./wid-tabua-mare.component.scss']
})

export class WidTabuaMareComponent implements OnInit {
  today: any = moment().format("YYYY-MM-DD")
  tideData: any = [];
  tideTableToday: any = [];
  timeX: any = 60;
  constructor(
    private tideService: TideService,
  ) { }

  colorScheme: any = {
    domain: [
      // Degradê
      '#6FAEF1',
      '#66C3EF',
      '#5EE5FB',
      '#5EE5FB',]
  }

  curve: any = curveMonotoneX;

  ngOnInit() {
    this.setupPage()
  }


  setupPage() {
    this.getData();
  }

  timeSeconds(now) {
    return (+now.format('HH') * 60 * 60 + (+now.format('mm') * 60) + +now.format('ss'));
  }


  async getData() {
    let data: any = await this.tideService.getTideData(this.today);
    // BUSCA TABELA DO DIA
    this.tideTableToday = (data || []).find(it => it.date == this.today)?.heights || [];

    // MONTA O GRAFICO DE ONDA, COM A ULTIMA DO DIA ANTERIOR, E A PROXIMA DO DIA SEGUINTE
    let tideData = [...data[0]?.heights.slice(-1), ...data[1]?.heights, data[2]?.heights[0]];

    let tideDataSeries = (tideData || []).map((it: any, i: any) => {
      let timelineX = this.timeSeconds(moment(it.time, 'HH:mm'));
      if (i == 0) timelineX -= 86400;
      if (i == 5) timelineX += 86400;
      return {
        name: timelineX,
        value: it.height
      }
    })
    this.tideData = [
      {
        name: 'Maré',
        series: tideDataSeries || []
      }
    ]
  }
}