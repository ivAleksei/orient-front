import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { ConfederationsService } from 'src/apps/baseorient/_shared/providers/confederations.service';
import { ActivatedRoute } from '@angular/router';
import { StatusPipe } from 'src/_shared/pipes/status.pipe';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-confederation-details',
  templateUrl: './confederation-details.page.html',
  styleUrls: ['./confederation-details.page.scss'],
})
export class ConfederationDetailsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild('ConfederationDetailForm') ConfederationDetailForm: any;

  tab: any = 'info';
  _id: any = '';
  federation: any;

  tableInfoContacts: any = {
    id: `table-confederation-contacts-${this._id}`,
    columns: [
      {
        title: 'Name', data: "person.name", render: (a, b, c) => {
          return [c.person?.name, c.person?.num_cbo].filter(k => k).join(' - ');
        }
      },
      { title: 'Position', data: "position" }
    ],
    data: [],
    actions: {
      buttons: [
        { action: "detail-athlete", tooltip: "Detalhe", class: "btn-light", icon: "mdi mdi-newspaper" },
        { action: "del", tooltip: "Remove", class: "btn-danger", icon: "mdi mdi-close" }
      ]
    }
  }
  tableInfoPartners: any = {
    id: `table-confederation-partners-${this._id}`,
    columns: [
      { title: 'Name', data: "name" },
      { title: 'Agent', data: "agent" },
      { title: 'Email', data: "email" },
      { title: 'Phone', data: "phone" },
    ],
    data: [],
    actions: {
      buttons: []
    }
  }

  tableInfoFederations: any = {
    id: `table-confederation-federations-${this._id}`,
    columns: [
      { title: 'State', data: "state" },
      { title: 'Slug', data: "slug" },
      { title: 'Name', data: "name" },
    ],
    data: [],
    actions: {
      buttons: [
        { action: "detail-federation", tooltip: "Detalhe", class: "btn-light", icon: "mdi mdi-newspaper" },
        { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" },
        { action: "del", tooltip: "Remove", class: "btn-danger", icon: "mdi mdi-close" }
      ]
    }
  }

  tableInfoClub: any = {
    id: `table-confederation-clubs-${this._id}`,
    columns: [
      { title: 'Slug', data: "slug" },
      { title: 'Name', data: "name" },
      {
        title: 'Status', data: "status", render: (a, b, c) => {
          return `
            <span class="badge ${this.StatusPipe.transform(c.status, 'class')}">
              ${this.StatusPipe.transform(c.status, 'label')}
            </span>
            `
        }
      },
    ],
    data: [],
    actions: {
      buttons: [
        { action: "detail-club", tooltip: "Detalhe", class: "btn-light", icon: "mdi mdi-newspaper" },
      ]
    }
  }

  tableInfoAthletes: any = {
    id: `table-confederation-athletes-${this._id}`,
    columns: [
      { title: 'CBO', data: "num_cbo" },
      { title: 'Helga', data: "_helga" },
      { title: 'Name', data: "name" },
      { title: 'Club', data: "clube.slug" },
    ],
    data: [],
    actions: {
      buttons: [
        { action: "detail-athlete", tooltip: "Detalhe", class: "btn-light", icon: "mdi mdi-newspaper" },
      ]
    }
  }

  tableInfoEvents: any = {
    id: `table-confederation-events-${this._id}`,
    columns: [
      { title: 'Helga', data: "_helga" },
      { title: 'Name', data: "name" },
    ],
    data: [],
    actions: {
      buttons: [
        { action: "detail-athlete", tooltip: "Detalhe", class: "btn-light", icon: "mdi mdi-newspaper" },
      ]
    }
  }

  tableInfoAudits: any = {
    id: `table-confederation-audit-${this._id}`,
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
    private confederationsService: ConfederationsService,
    private alertsService: AlertsService
  ) {
    this.route.params.subscribe((params: any) => {
      this._id = params?.id || null;

      this.tableInfoPartners.ajax = {
        url: `${environment.API.orient}/server_side/partners?conf=` + this._id,
      }
      this.tableInfoContacts.ajax = {
        url: `${environment.API.orient}/server_side/contacts?conf=` + this._id,
      }
      this.tableInfoFederations.ajax = {
        url: `${environment.API.orient}/server_side/federations?conf=` + this._id,
      }
      this.tableInfoClub.ajax = {
        url: `${environment.API.orient}/server_side/clubs?conf=` + this._id,
      }
      this.tableInfoAthletes.ajax = {
        url: `${environment.API.orient}/server_side/athletes?conf=` + this._id,
      }
      this.tableInfoEvents.ajax = {
        url: `${environment.API.orient}/server_side/events?conf=` + this._id,
      }
      this.reloadTable.next(true);
      this.loadConfederationDetail();
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
   * loadConfederationDetail: Método que busca as viaturas para o autocomplete.
   */
  async loadConfederationDetail() {
    this.loadingService.show();
    let data = await this.confederationsService.getConfederationById({ _id: this._id });
    this.federation = data || null;
    this.loadingService.hide();
  }

  handleTable(ev) {
    let map = {
      "detail-federation": () => {
        this.nav.navigateForward(['/internal/admin/federation/', ev.data._id]);
      },
      "detail-club": () => {
        this.nav.navigateForward(['/internal/admin/club/', ev.data._id]);
      },
      "detail-athlete": () => {
        this.nav.navigateForward(['/internal/admin/person/', ev.data._id]);
      },
    }

    return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.ConfederationDetailForm.value);
    this.confederationsService.saveConfederation(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

}
