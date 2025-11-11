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

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
})
export class EventDetailsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild('EventDetailForm') EventDetailForm: any;

  tab: any = 'info';
  _id: any = '';
  event: any;

  tableInfoCategories: any = {
    id: `table-event-categories-${this._id}`,
    columns: [
      { title: 'Name', data: "name" },
      { title: 'Route', data: "route" },
      { title: 'Subscriptions', data: "n_subs" },
    ],
    data: [],
    actions: {
      buttons: [
        { action: "detail-map", tooltip: "Mapa", class: "btn-light", icon: "mdi mdi-map" },
        { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" }, // TODO
        { action: "remove", tooltip: "Remover", class: "btn-danger", icon: "mdi mdi-close" }, // TODO
      ]
    }
  }

  tableInfoSubscriptions: any = {
    id: `table-event-subscription-${this._id}`,
    columns: [
      { title: 'Category', data: "category.name" },
      { title: 'Num Start', data: "num_start" },
      { title: 'Name', data: "name" },
      {
        title: 'Club', data: "club.name", render: (a, b, c) => {
          return [c.club?.slug, c.club?.name].filter(k => k).join(' - ')
        }
      },
      { title: 'Control', data: "controlcard" },
      {
        title: 'Pos', data: "pos", render: (a, b, c) => {
          return c.pos || c.status;
        }
      },
      { title: 'Time', data: "str_time" },
    ],
    data: [],
    actions: {
      buttons: [
        { action: "sync", tooltip: "sync", class: "btn-warning", icon: "mdi mdi-sync" },
        { action: "result", tooltip: "Extrato", class: "btn-warning", icon: "mdi mdi-file-document" }, // TODO
        { action: "detail-athlete", tooltip: "Ficha Pessoal", class: "btn-light", icon: "mdi mdi-account" }, // TODO
      ]
    }
  }

  tableInfoRoutes: any = {
    id: `table-event-routes-${this._id}`,
    columns: [
      { title: 'Ref', data: "ref" },
      { title: 'Dist', data: "dist" },
      { title: 'Climb', data: "climb" },
      { title: 'Num PCs', data: "num_pcs" },
      { title: 'Categories', data: "categories" },
    ],
    data: [],
    actions: {
      buttons: [
        { action: "detail-map", tooltip: "Mapa", class: "btn-light", icon: "mdi mdi-map" },
        { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" }, // TODO
        { action: "remove", tooltip: "Remover", class: "btn-danger", icon: "mdi mdi-close" }, // TODO
      ]
    }
  }

  tableInfoAudits: any = {
    id: `table-event-audit-${this._id}`,
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
    private alertsService: AlertsService
  ) {
    this.route.params.subscribe((params: any) => {
      this._id = params?.id || null;

      this.tableInfoCategories.ajax = {
        url: `${environment.API.orient}/server_side/event-categories?ev=` + this._id,
      }
      this.tableInfoSubscriptions.ajax = {
        url: `${environment.API.orient}/server_side/event-subscriptions?ev=` + this._id,
      }
      this.tableInfoRoutes.ajax = {
        url: `${environment.API.orient}/server_side/event-routes?ev=` + this._id,
      }

      this.reloadTable.next(true);
      this.loadEventDetail();
    })
  }
  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  setTab(ev) {
    let new_val = ev?.detail?.value || ev;
    if (new_val != this.tab) this.tab = new_val;
  }

  getData() {
  }

  /**
   * loadEventDetail: Método que busca as viaturas para o autocomplete.
   */
  async loadEventDetail() {
    this.loadingService.show();
    let data = await this.eventsService.getEventById({ _id: this._id });
    this.event = data || null;
    this.loadingService.hide();
  }

  handleTable(ev) {
    let map = {
      result: args => this.nav.navigateForward(['/internal/admin/result', ev.data._id]),
      "detail-athlete": () => {
        this.nav.navigateForward(['/internal/admin/person/', ev.data._person]);
      },
    }

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
