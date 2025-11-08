import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { FederationsService } from 'src/apps/baseorient/_shared/providers/federations.service';
import { ConfederationsService } from 'src/apps/baseorient/_shared/providers/confederations.service';
import { ResourcesService } from 'src/apps/baseorient/_shared/providers/resources.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-federations',
  templateUrl: './federations.page.html',
  styleUrls: ['./federations.page.scss'],
})
export class FederationsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalFederation") modalFederation: any;
  @ViewChild('FederationForm') FederationForm: any;
  arr_confederations: any[] = [];
  arr_state_city: any[] = [];

  tableInfo: any = {
    id: "table-federations",
    columns: [
      { title: 'Confederation', data: "confederation.slug" },
      { title: 'State', data: "state" },
      { title: 'Slug', data: "slug" },
      { title: 'Name', data: "name" },
    ],
    ajax: {
      url: `${environment.API.orient}/server_side/federations`,
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
    private loadingService: LoadingService,
    private resourcesService: ResourcesService,
    private confederationsService: ConfederationsService,
    private federationsService: FederationsService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.loadConfederations();
    this.loadState();
  }

  async loadConfederations() {
    this.loadingService.show();
    let data = await this.confederationsService.getConfederations();
    this.arr_confederations = (data || []);
    this.loadingService.hide();
  }

  async loadState() {
    this.loadingService.show();
    let data = await this.resourcesService.getCityState();
    this.arr_state_city = (data || []);
    this.loadingService.hide();
  }

  handleTable(ev) {
    let map = {
      edit: () => {
        this.modalFederation.present();
        setTimeout(() => {
          this.FederationForm.form.patchValue(ev.data);
        }, 400);
      },
      new: () => {
        this.modalFederation.present();
      },
      detail: () => {
        this.nav.navigateForward(['/internal/admin/federation/', ev.data._id]);
      },
      del: () => {
        this.federationsService.delFederation(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearFederationForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.FederationForm.value);
    this.federationsService.saveFederation(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearFederationForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearFederationForm() {
    this.FederationForm?.form.reset();
    this.closeModal();
    this.reloadTable.next(true);
  }

  closeModal() {
    this.modalFederation.dismiss();
  }

}
