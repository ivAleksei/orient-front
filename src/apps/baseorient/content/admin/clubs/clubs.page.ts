import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { StatusPipe } from 'src/_shared/pipes/status.pipe';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { ClubsService } from 'src/apps/baseorient/_shared/providers/clubs.service';
import { FederationsService } from 'src/apps/baseorient/_shared/providers/federations.service';
import { ResourcesService } from 'src/apps/baseorient/_shared/providers/resources.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Component({
  selector: 'app-clubs',
  templateUrl: './clubs.page.html',
  styleUrls: ['./clubs.page.scss'],
})
export class ClubsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalClub") modalClub: any;
  @ViewChild('ClubForm') ClubForm: any;
  list_clubs: any[] = [];
  arr_federations: any[] = [];
  arr_state_city: any[] = [];
  arr_city: any[] = [];

  tableInfo: any = {
    id: "table-clubs",
    columns: [
      { title: 'Slug', data: "slug" },
      { title: 'Name', data: "name" },
      { title: 'Federation', data: "federation.slug" },
      { title: 'Confederation', data: "confederation.slug" },
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
    ajax: {
      url: `${environment.API.orient}/server_side/clubs`,
    },
    actions: {
      buttons: [
        { action: "detail", tooltip: "Detalhe", class: "btn-light", icon: "mdi mdi-newspaper" },
        { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" },
        { action: "del", tooltip: "Remove", class: "btn-danger", icon: "mdi mdi-close" }
      ]
    }
  }

  constructor(
    public i18n: I18nService,
    private nav: NavController,
    private utils: UtilsService,
    private StatusPipe: StatusPipe,
    private loadingService: LoadingService,
    private federationsService: FederationsService,
    private resourcesService: ResourcesService,
    private clubsService: ClubsService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.loadFederations();
    this.loadState();
  }

  async loadFederations() {
    this.loadingService.show();
    let data = await this.federationsService.getFederations();
    this.arr_federations = (data || []);
    this.loadingService.hide();
  }

  async loadState() {
    this.loadingService.show();
    let data = await this.resourcesService.getCityState();
    this.arr_state_city = (data || []);
    this.loadingService.hide();
  }

  setArrCity() {
    let obj = Object.assign({}, this.ClubForm.value);
    this.arr_city = (this.arr_state_city || []).find(it => it.sigla == obj.state)?.cidades || [];
  }

  setConfederation() {
    let obj = Object.assign({}, this.ClubForm.value);
    let _confederation = (this.arr_federations || []).find(it => it._id == obj._federation)?._confederation || null;
    this.ClubForm.form.patchValue({ _confederation: _confederation });
  }

  handleTable(ev) {
    let map = {
      edit: () => {
        this.modalClub.present();
        setTimeout(() => {
          this.ClubForm.form.patchValue(ev.data);

          if (ev.data.state)
            this.setArrCity();
        }, 400);
      },
      detail: () => {
        this.nav.navigateForward(['/internal/admin/club/', ev.data._id]);
      },
      new: () => {
        this.modalClub.present();
      },
      del: () => {
        this.clubsService.delClub(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearClubForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.ClubForm.value);
    this.clubsService.saveClub(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearClubForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearClubForm() {
    this.ClubForm?.form.reset();
    this.closeModal();
    this.reloadTable.next(true);
  }

  closeModal() {
    this.modalClub.dismiss();
  }

}
