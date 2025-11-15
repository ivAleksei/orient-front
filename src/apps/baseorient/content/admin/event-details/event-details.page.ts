import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { NavController } from '@ionic/angular';
import { StatusPipe } from 'src/_shared/pipes/status.pipe';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from 'src/apps/baseorient/_shared/providers/events.service';
import { PersonsService } from 'src/apps/baseorient/_shared/providers/persons.service';
import { EventCategoriesService } from 'src/apps/baseorient/_shared/providers/event-categories.service';
import { EventRoutesService } from 'src/apps/baseorient/_shared/providers/event-routes.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
})
export class EventDetailsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild('EventDetailForm') EventDetailForm: any;

  mobile: any = innerWidth <= 768;
  tab: any = 'info';
  _id: any = '';
  event: any;

  tableInfoRaces: any = {
    columns: [
      { title: 'Date', data: "dt_start", datatype: "pipe", pipe: "DatePipe", options: "DD/MM/YYYY HH:mm" },
      { title: 'Name', data: "name" },
    ],
    data: [],
    actions: {
      buttons: [
        { action: "detail", tooltip: "Detalhes", class: "btn-light", icon: "mdi mdi-newspaper" },
        // { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" }, // TODO
        // { action: "remove", tooltip: "Remover", class: "btn-danger", icon: "mdi mdi-close" }, // TODO
      ]
    }
  }

  tableInfoCategories: any = {
    columns: [
      { title: 'Name', data: "name" },
      { title: 'Dist', data: "dist", render: (a, b, c) => c.routes.find(it => it)?.dist },
      { title: 'Climb', data: "climb", render: (a, b, c) => c.routes.find(it => it)?.climb },
      { title: 'N. PCS', data: "n_pcs", render: (a, b, c) => c.routes.find(it => it)?.n_pcs },
      {
        title: 'Routes', data: "routes", render: (a, b, c) => {

          return Object.values(c.routes || {}).map((r: any) => r.name).join(', ');
        }
      },
      { title: 'N. Subs', data: "n_subs"},
    ],
    data: [],
    actions: {
      buttons: [
        { action: "map_open", tooltip: "Abrir Mapa", class: "btn-warning", icon: "mdi mdi-map", conditional: args => args.map?._id },
        // { action: "replay_category", tooltip: "Replay", class: "btn-info", icon: "mdi mdi-play" }, // TODO
        // { action: "detail-map", tooltip: "Mapa", class: "btn-light", icon: "mdi mdi-map" },
        // { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" }, // TODO
        // { action: "remove", tooltip: "Remover", class: "btn-danger", icon: "mdi mdi-close" }, // TODO
      ]
    }
  }

  tableInfoSubscriptions: any = {
    columns: [
      { title: 'Category', data: "category" },
      { title: 'Num Start', data: "startnumber" },
      { title: 'Name', data: "name" },
      { title: 'Club', data: "club" },
      { title: 'Control', data: "controlcard" },
      {
        title: 'Pos', data: "pos", render: (a, b, c) => {
          return c.pos || c.status;
        }
      },
      { title: 'Time', data: "time", datatype: 'pipe', pipe: "TimePipe" },
    ],
    data: [],
    actions: {
      buttons: [
        { action: "replay_sub", tooltip: "Replay", class: "btn-info", icon: "mdi mdi-play" }, // TODO
        { action: "sync", tooltip: "sync", class: "btn-warning", icon: "mdi mdi-sync" },
        { action: "result", tooltip: "Extrato", class: "btn-warning", icon: "mdi mdi-file-document" }, // TODO
        { action: "detail-athlete", tooltip: "Ficha Pessoal", class: "btn-light", icon: "mdi mdi-account" }, // TODO
      ]
    }
  }

  tableInfoRoutes: any = {
    columns: [
      { title: 'Name', data: "name" },
      { title: 'Dist', data: "dist" },
      { title: 'Climb', data: "climb" },
      { title: 'Num PCs', data: "n_pcs" },
      { title: 'N. Subs', data: "n_subs"},
      {
        title: 'Categories', data: "categories", render: (a, b, c) => {
          return (c.categories || []).map(it => {
            if (it.map)
              return `<a id="${it._id}" href="${it?.map?.file?.url || 'javascript:void(0)'}" target="_blank">${it.name}</a>`;

            return it.name;
          }
          ).join(', ');
        }
      },
    ],
    data: [],
    actions: {
      buttons: [
        { action: "map_open", tooltip: "Abrir Mapa", class: "btn-warning", icon: "mdi mdi-map", conditional: args => args.map?._id },
        { action: "map_send", tooltip: "Enviar Mapa", class: "btn-light", icon: "mdi mdi-upload" },
        { action: "replay_route", tooltip: "Replay", class: "btn-info", icon: "mdi mdi-play" },
        // { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" }, // TODO
        // { action: "remove", tooltip: "Remover", class: "btn-danger", icon: "mdi mdi-close" }, // TODO
      ]
    }
  }

  tableInfoAudits: any = {
    columns: [
      { title: 'Event', data: "" },
    ],
    data: [],
    actions: {
      buttons: [
        { action: "detail-athlete", tooltip: "Detalhe", class: "btn-light", icon: "mdi mdi-newspaper" },
      ]
    }
  }

  constructor(
    public i18n: I18nService,
    private nav: NavController,
    private StatusPipe: StatusPipe,
    private route: ActivatedRoute,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private personsService: PersonsService,
    private eventsService: EventsService,
    private eventRoutesService: EventRoutesService,
    private eventCategoriesService: EventCategoriesService,
    private alertsService: AlertsService
  ) {
    this.route.params.subscribe((params: any) => {
      this._id = params?.id || null;

      this.tableInfoRaces.id = `table-event-races-${this._id}`;
      this.tableInfoCategories.id = `table-event-categories-${this._id}`;
      this.tableInfoRoutes.id = `table-event-routes-${this._id}`;
      this.tableInfoSubscriptions.id = `table-event-subscriptions-${this._id}`;
      this.tableInfoAudits.id = `table-event-audits-${this._id}`;

      this.tableInfoSubscriptions.ajax = {
        url: `${environment.API.orient}/server_side/event-subscriptions?ev=` + this._id,
      }
      this.tableInfoRaces.ajax = {
        url: `${environment.API.orient}/server_side/event-races?ev=` + this._id,
      }

      this.reloadTable.next(true);
      this.loadEventDetail();
    })
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    window.addEventListener('resize', () => {
      this.mobile = innerWidth <= 768;
    })
  }
  ionViewWillLeave() {
    window.removeEventListener('resize', null);
  }

  setTab(ev) {
    let new_val = ev?.detail?.value || ev;
    if (new_val != this.tab) this.tab = new_val;

    let handleTab = {
      info: () => {

      },
      races: () => {

      },
      categories: () => {
        this.getEventCategories();
      },
      routes: () => {
        this.getEventRoutes();
      },
      subscriptions: () => {

      },
      audit: () => {

      },
    }

    if (handleTab[this.tab])
      handleTab[this.tab]();
  }

  async getEventRoutes() {
    this.loadingService.show();
    let data = await this.eventRoutesService.getEventRoutes({ _event: this._id }, `
      _id
      name  
      dist
      climb
      n_pcs
      n_subs
      categories{
        _id
        name
        map{
          file{
            url
          }
        }
      }
      map{
        _id
        file{
          url
        }
      }
    `);
    this.tableInfoRoutes.data = (data || []).map(it => {
      it.label = `${it.name} - ${(it.categories || []).map(c => c.name).join(',')}`
      return it;
    })
    this.loadingService.hide();
    this.reloadTable.next(true);
  }

  async getEventCategories() {
    this.loadingService.show();
    let data = await this.eventCategoriesService.getEventCategories({ _event: this._id }, `
      _id
      _event
      _race
      name  
      n_subs
      routes{
        name
        dist
        climb
        n_pcs
        map{
          file{
            url
          }
        }
      }
      map{
        _id
        file{
          url
        }
      }
    `);
    this.tableInfoCategories.data = data || [];
    this.loadingService.hide();
    this.reloadTable.next(true);
  }
  /**
 * loadEventDetail: Método que busca as viaturas para o autocomplete.
 */
  async loadEventDetail() {
    this.loadingService.show();
    let data = await this.eventsService.getEventById({ _id: this._id }, `
      name
    `);
    this.event = data || null;
    this.loadingService.hide();
  }

  // TODO
  async getRoutes() {
    // let data = await this.eventsService.getEventById({ _id: this._id }, `
    //   name
    // `);
    // this.routes = data || null;

  }

  handleTable(ev) {
    let map = {
      map_open: args => {
        console.log(ev.data);

        window.open(ev.data.map?.file?.url, '_blank');
      },
      replay_sub: args => this.nav.navigateForward(['/internal/replay'], {
        state: {
          _subscription: ev.data._id
        }
      }),
      replay_category: args => this.nav.navigateForward(['/internal/replay'], {
        state: {
          _subscription: ev.data._id
        }
      }),
      sync: () => this.personsService.syncHelga({ _id: ev.data._person }),
      result: args => this.nav.navigateForward(['/internal/admin/result', ev.data._id]),
      "detail-athlete": () => {
        this.nav.navigateForward(['/internal/admin/person/', ev.data._person]);
      },
    }

    if (map[ev.action])
      return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.EventDetailForm.value);
    this.eventsService.saveEvent(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

}
