import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { HttpService } from 'src/_shared/services/http.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { LocationService } from 'src/_shared/services/location.service';
import { environment } from 'src/apps/sisbom_web/environments/environment';

@Component({
  selector: 'app-wid-wheather',
  templateUrl: './wid-wheather.component.html',
  styleUrls: ['./wid-wheather.component.scss']
})
export class WidWheatherComponent implements OnInit {
  // Dados de clima atual (mockado)
  currentWeather: any = {};
  day: any;
  coords: any;
  info: any;



  // Previsão dos próximos dias (mockada)
  forecast = [
    { day: 'Ter', icon: 'cloud', min: 23, max: 31 },
    { day: 'Qua', icon: 'rain', min: 22, max: 30 },
    { day: 'Qui', icon: 'cloudy', min: 24, max: 32 },
  ];

  constructor(
    private loading: LoadingService,
    private http: HttpService,
    private locationService: LocationService
  ) { }

  ngOnInit() {
    this.setup();
  }

  async setup() {
    this.coords = await this.locationService.getCurrentLocation();
    if (!this.coords?.lat) this.coords.lat = -5.8048485;
    if (!this.coords?.lng) this.coords.lng = -35.2078972;
    this.getInfo();
  }

  async getInfo() {
    this.loading.show();
    let url = [environment.API.url, 'ws', 'weather'].join('/') + '?';
    url += Object.keys(this.coords || {}).map(k => [k, this.coords[k]].join('=')).join('&')

    this.info = await this.http.get(url);
    this.loading.hide();
    if (!this.info) return;

    let hour = moment().startOf('hour').format('HH:mm');
    this.day = moment().isBetween(moment('06:00', 'HH:mm'), moment('18:00', 'HH:mm'), 'minutes');

    this.info.str = [this.info?.city, this.info?.state].join('/');
    this.info.curr_temp = this.info?.temperature[hour];
    this.info.curr_icon = this.info?.weather[hour]?.icon;

    this.currentWeather.icon = this.info.curr_icon;
    this.currentWeather.city = this.info.str;
    this.currentWeather.temp = this.info.curr_temp;
  }


  // Função para pegar os ícones correspondentes aos tipos de clima
  getIcon(icon: string): string {
    const icons: any = {
      day: {
        clear: 'https://cdn-icons-png.flaticon.com/512/1163/1163662.png',
        cloudy: 'https://cdn-icons-png.flaticon.com/128/1888/1888282.png',
        rain: 'https://cdn-icons-png.flaticon.com/512/1163/1163657.png',
      },
      night: {
        clear: 'https://cdn-icons-png.flaticon.com/128/10763/10763330.png',
        rain: 'https://cdn-icons-png.flaticon.com/128/12276/12276658.png',
        cloudy: 'https://cdn-icons-png.flaticon.com/128/13169/13169886.png',
      }
    };


    return icons[this.day ? 'day' : 'night'][icon];
  }

}
