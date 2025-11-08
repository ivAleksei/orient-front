import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { StatusPipe } from 'src/_shared/pipes/status.pipe';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { ClubsService } from 'src/apps/baseorient/_shared/providers/clubs.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Component({
  selector: 'app-club-details',
  templateUrl: './club-details.page.html',
  styleUrls: ['./club-details.page.scss'],
})
export class ClubDetailsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild('ClubDetailForm') ClubDetailForm: any;

  tab: any = 'personal';
  _id: any = '';
  clube: any;

  tableInfoContacts: any = {
    id: `table-clube-contacts-${this._id}`,
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
        { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" },
        { action: "del", tooltip: "Remove", class: "btn-danger", icon: "mdi mdi-close" }
      ]
    }
  }

  tableInfoEvents: any = {
    id: `table-clube-events-${this._id}`,
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

  tableInfoAthletes: any = {
    id: `table-clube-athletes-${this._id}`,
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

  constructor(
    public i18n: I18nService,
    private nav: NavController,
    private StatusPipe: StatusPipe,
    private route: ActivatedRoute,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private clubesService: ClubsService,
    private alertsService: AlertsService
  ) {
    this.route.params.subscribe((params: any) => {
      this._id = params?.id || null;
      this.tableInfoContacts.ajax = {
        url: `${environment.API.orient}/server_side/contacts?fed=` + this._id,
      }
      this.tableInfoAthletes.ajax = {
        url: `${environment.API.orient}/server_side/athletes?club=` + this._id,
      }
      this.tableInfoEvents.ajax = {
        url: `${environment.API.orient}/server_side/events?club=` + this._id,
      }
      this.reloadTable.next(true);
      this.loadClubDetail();
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
   * loadClubDetail: Método que busca as viaturas para o autocomplete.
   */
  async loadClubDetail() {
    this.loadingService.show();
    let data = await this.clubesService.getClubById({ _id: this._id });
    this.clube = data || null;
    this.loadingService.hide();
  }

  handleTable(ev) {
    let map = {
      "detail-athlete": () => {
        this.nav.navigateForward(['/internal/admin/person/', ev.data._id]);
      },
    }

    return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.ClubDetailForm.value);
    this.clubesService.saveClub(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

}
