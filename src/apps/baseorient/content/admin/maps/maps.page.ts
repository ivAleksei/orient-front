import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { DatePipe } from 'src/_shared/pipes/date.pipe';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { HttpService } from 'src/_shared/services/http.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { EventCategoriesService } from 'src/apps/baseorient/_shared/providers/event-categories.service';
import { EventRacesService } from 'src/apps/baseorient/_shared/providers/event-races.service';
import { EventRoutesService } from 'src/apps/baseorient/_shared/providers/event-routes.service';
import { EventsService } from 'src/apps/baseorient/_shared/providers/events.service';
import { MapsService } from 'src/apps/baseorient/_shared/providers/maps.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss']
})
export class MapsPage implements OnInit {
  @Output() public clearEvent: EventEmitter<any> = new EventEmitter();
  @Output() public inputEvent: EventEmitter<any> = new EventEmitter();
  @Output() public inputRace: EventEmitter<any> = new EventEmitter();
  @Output() public inputRoute: EventEmitter<any> = new EventEmitter();
  @Output() public inputCategory: EventEmitter<any> = new EventEmitter();
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalMap") modalMap: any;
  @ViewChild('MapForm') MapForm: any;
  list_maps: any[] = [];
  arr_events: any[] = [];
  arr_races: any[] = [];
  arr_routes: any[] = [];
  arr_categories: any[] = [];

  tableInfo: any = {
    id: "table-maps",
    columns: [
      { title: 'Date', data: "event.dt_start", datatype: "pipe", pipe: "DatePipe", options: "DD/MM/YYYY HH:mm" },
      { title: 'Event', data: "event.name" },
      { title: 'Route', data: "route.name" },
      {
        title: 'Categories', data: "route.categories", render: (a, b, c) => {
          return (c.route.categories || []).map(it => it.name).join(',')
        }
      },
    ],
    data: [],
    actions: {
      buttons: [
        { action: "map", tooltip: "Detail", class: "btn-light", icon: "mdi mdi-map" },
        { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" },
        { action: "del", tooltip: "Remove", class: "btn-danger", icon: "mdi mdi-close" }
      ]
    }
  }

  constructor(
    public i18n: I18nService,
    private http: HttpService,
    private utils: UtilsService,
    private DatePipe: DatePipe,
    private loadingService: LoadingService,
    private eventsService: EventsService,
    private eventRacesService: EventRacesService,
    private eventRoutesService: EventRoutesService,
    private eventCategoriesService: EventCategoriesService,
    private mapsService: MapsService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.getMaps();
    this.getEvents();
    this.getEventRaces();
    this.getEventRoutes();
    this.getEventCategories();
  }

  async getMaps() {
    let data = await this.mapsService.getMaps(null, `
      _id
      _event
      _race
      _route
      
      event{
        dt_start
        name
      }
      route{
        name
        categories{
          name
        }
      }
      file{
        url
      }
    `);
    this.tableInfo.data = data || [];
    this.reloadTable.next(true);
  }

  async getEvents() {
    let data = await this.eventsService.getEvents(null, `
      _id
      name  
      dt_start
    `);
    this.arr_events = data || [];
  }
  async getEventRaces() {
    let data = await this.eventRacesService.getEventRaces(null, `
      _id
      _event
      dt_start
      name  
    `);
    this.arr_races = (data || []).map(it => {

      it.label = `${this.DatePipe.transform(it.dt_start)} - ${it.name}`

      return it;
    });
  }
  async getEventRoutes() {
    let data = await this.eventRoutesService.getEventRoutes(null, `
      _id
      _event
      _race
      name  
      categories{
        _id
        name
      }
    `);
    this.arr_routes = (data || []).map(it => {

      it.label = `${it.name} - ${(it.categories || []).map(c => c.name).join(',')}`

      return it;
    })
  }
  async getEventCategories() {
    let data = await this.eventCategoriesService.getEventCategories(null, `
      _id
      _event
      _race
      name  
    `);
    this.arr_categories = data || [];
  }

  setInputs(type: any) {
    let obj = Object.assign({}, this.MapForm.value);
    if (type == 'race') {
      let race = this.arr_races.find(it => it._id == obj._race);
      this.MapForm.form.patchValue({ _event: race?._event || null });
    }
    if (type == 'route') {
      this.MapForm.form.patchValue({ _category: null });
    }
    if (type == 'category') {
      let route = (this.arr_routes || []).find(it => it._race == obj._race && it.categories.find(c => c._id == obj._category));
      console.log(obj, route);

      this.MapForm.form.patchValue({ _route: route?._id || null });
    }
  }

  file: any;

  selectFile(ev: any) {
    let files: File[] = Array.from(ev.target?.files);
    if (!files?.length) return;

    let file = files[0];

    if (this.utils.validFile(file)) {
      this.file = file;
      ev.target.value = '';
    } else {
      this.alertsService.notify({ type: "warning", subtitle: "Falha na seleção de arquivo." })
    }
  }

  handleTable(ev) {
    let map = {
      edit: () => {
        this.modalMap.present();
        setTimeout(() => {
          this.inputRace.next(ev.data?._race);
          this.MapForm.form.patchValue(ev.data);
        }, 400);
      },
      map: () => {
        window.open(ev.data?.file?.url, '_blank');
      },
      new: () => {
        this.modalMap.present();
      },
      del: () => {
        this.mapsService.delMap(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearMapForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    if (map[ev.action])
      return map[ev.action](ev.data);
  }

  async saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.MapForm.value);

    if (!this.file)
      return this.alertsService.notify({ type: "warning", subtitle: this.i18n.lang.NO_FILE_SELECTED })

    // UPLOAD FILES
    let url = [environment.API.storage, 'uploads', 'index.php'].join("/");
    let payload: any = { _id: obj._event };

    let data_upl = await this.http.post(url, {
      id: payload._id, folder: 'baseorient_maps'
    }, { arquivo: this.file });

    obj.file = data_upl;

    this.mapsService.saveMap(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearMapForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearMapForm() {
    this.file = null;
    this.MapForm?.form.reset();
    this.closeModal();
    this.clearEvent.next(true);
    this.getMaps();
  }

  closeModal() {
    this.modalMap.dismiss();
  }

  getFiles(id?: any) {
    $('#' + id).click();
  }

}
