import $ from "jquery";
import moment from "moment";
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { AlertsService } from "src/_shared/services/alerts.service";
import { LocalStorageService } from "src/_shared/services/local-storage.service";

@Injectable()
export class UtilsService {
  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  http: any;
  mobile: any = false;
  colorSchemePrimary: any = {
    domain: ['#EC3337', '#BA292B', '#FF383B']
  };
  colorSchemeSecondary: any = {
    domain: ['#ffcc28', '#CCA421', '#FFDF75']
  };
  colorSchemeTertiary: any = {
    domain: ['#5260ff', '#4854e0', '#6370ff']
  };

  colors: any = ["#414dcc", "#2dd36f", "#92949c", "#ff8fe6", "#ffc409", "#ff5b09", "#eb445a", '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

  calendarOptions: any = {
    // LAYOUT
    headerToolbar: {
      start: '',
      center: 'title',
      end: 'prev,next'
    },
    titleFormat: { year: 'numeric', month: 'short' },
    buttonText: {
      today: 'HOJE',
      month: 'MÊS',
      week: 'SEMANA',
      day: 'DIA',
      list: 'LISTA'
    },
    noEventsContent: "Nenhum registro encontrado",
    buttonIcons: {
      prev: 'a mdi mdi-arrow-left-drop-circle',
      next: 'a mdi mdi-arrow-right-drop-circle',
      prevYear: 'a mdi mdi-chevron-double-left', // double chevron
      nextYear: 'a mdi mdi-chevron-double-right' // double chevron
    },
    dayHeaderFormat: { weekday: 'short' },
    // DISPLAY
    eventDisplay: "list-item",
    initialView: 'dayGridMonth',
    initialDate: moment().format('YYYY-MM-DD'),
    aspectRatio: 1,
    height: 'auto',
    expandRows: true,
    showNonCurrentDates: false,
    eventBackgroundColor: "#EC3337",
    eventBorderColor: "#BA292B",
    plugins: [
      dayGridPlugin,
      interactionPlugin
    ],
    locale: 'pt-BR',
    themeSystem: 'standard',
  };

  constructor(
    private storage: LocalStorageService,
    private alertsService: AlertsService
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(false);
    this.watch = this._watch.asObservable();
  }

  removeAcento(str) {
    let com_acento = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ";
    let sem_acento = "AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr";
    let novastr = "", troca;
    for (let i = 0; i < str.length; i++) {
      troca = false;
      for (let a = 0; a < com_acento.length; a++) {
        if (str.substr(i, 1) == com_acento.substr(a, 1)) {
          novastr += sem_acento.substr(a, 1);
          troca = true;
          break;
        }
      }
      if (troca == false) {
        novastr += str.substr(i, 1);
      }
    }
    novastr = novastr.replace(/\W/g, '');
    return novastr.toLocaleLowerCase();
  }

  validFile(file) {
    let size = +(file.size / 1048576).toFixed(1);
    if (size > 5) {
      this.alertsService.notify({ type: "warning", subtitle: "O tamanho do arquivo excede 5MB" });
      return false;
    }

    return true;
  }

  async loopArrayPromise(array, promise) {
    if (!array) array = [];
    let handleIndex = (index) => {
      return Promise.resolve(array[index]).then((obj) => {
        if (!obj) return array;
        return promise(obj).then((done) => handleIndex(index + 1));
      });
    };

    return handleIndex(0).then((done) => {
      return done;
    });
  }

  public formatsDate: any = [
    moment.ISO_8601,
    "MM-DD",
    "YYYY-MM",
    "YYYY-MM-DD",
    "DD/MM/YYYY",
    "DD MMM YYYY",
    "x",
  ];

  public dateConfig: any = {
    dateInputFormat: "DD/MM/YYYY",
    placeholder: "DD/MM/YYYY",
    showWeekNumbers: false,
    isAnimated: false,
  };

  public dateRangeConfig: any = {
    rangeInputFormat: "DD/MM/YYYY",
    placeholder: "DD/MM/YYYY - DD/MM/YYYY",
    showWeekNumbers: false,
    isAnimated: false,
  };

  async handleLanguage() {
    let lang;
    let user = await this.storage.get('user');

    if (user && user.language)
      lang = user.language;

    this.dateConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dateConfig.placeholder = 'DD/MM/YYYY';
    this.dateRangeConfig.rangeInputFormat = "DD/MM/YYYY";
    this.dateRangeConfig.placeholder = "DD/MM/YYYY - DD/MM/YYYY";

    if (lang != 1) {
      this.dateConfig.dateInputFormat = 'MM/DD/YYYY';
      this.dateConfig.placeholder = 'MM/DD/YYYY';

      this.dateRangeConfig.rangeInputFormat = "MM/DD/YYYY";
      this.dateRangeConfig.placeholder = "MM/DD/YYYY - MM/DD/YYYY";
    }

    this._watch.next(true);
  }

  addressStr(obj: any) {
    return Object.keys(obj).map(k => obj[k]).join(', ');
  }

  getObjContent(prop, obj) {
    let content;
    try {
      if (prop && prop.includes(".")) {
        let split = prop.split(".");
        content = obj;
        for (const s of split) {
          content = content[s];
          if (!content) {
            content = "-";
            continue;
          }
        }
      }

      if (!content) content = obj[prop];

      if (!content) return "-";

      return content;
    } catch (error) {
      return "-";
    }
  }

  copyToClipboard(text) {
    navigator?.clipboard?.writeText(text);
    if (navigator?.clipboard)
      this.alertsService.notify({ type: "info", subtitle: "Texto copiado!" })
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }


  mapObj(arr, prop) {
    let obj = {};
    for (let a of arr) {
      obj[a[prop]] = a;
    }
    return obj;
  }

  getBase64(file) {
    return new Promise((resolve) => {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
        resolve(null);
      };
    })
  }


  validaCPF(strCPF) {
    let Soma;
    let Resto;
    Soma = 0;
    if (strCPF == "00000000000") return false;

    for (let i = 1; i <= 9; i++)
      Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;

    if (Resto == 10 || Resto == 11) Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10))) return false;

    Soma = 0;
    for (let i = 1; i <= 10; i++)
      Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if (Resto == 10 || Resto == 11) Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11))) return false;
    return true;
  }

  validCGC(cgc) {
    cgc = cgc.replace(/\D/g, '');
    if (cgc.length == 11)
      return this.validaCPF(cgc);
  }
}
