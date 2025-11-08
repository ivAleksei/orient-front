import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { ClubsService } from 'src/apps/baseorient/_shared/providers/clubs.service';
import { ConfederationsService } from 'src/apps/baseorient/_shared/providers/confederations.service';
import { FederationsService } from 'src/apps/baseorient/_shared/providers/federations.service';
import { PartnersService } from 'src/apps/baseorient/_shared/providers/partners.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.page.html',
  styleUrls: ['./partners.page.scss'],
})
export class PartnersPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalPartner") modalPartner: any;
  @ViewChild('PartnerForm') PartnerForm: any;
  list_partners: any[] = [];
  arr_federations: any[] = [];
  arr_confederations: any[] = [];
  arr_clubs: any[] = [];
  arr_persons: any[] = [];

  tableInfo: any = {
    id: "table-partners",
    columns: [
      { title: 'Name', data: "name" },
      { title: 'Agent', data: "agent" },
      { title: 'Email', data: "email" },
      { title: 'Phone', data: "phone" },
      { title: 'Confederation', data: "confederation.slug" },
      { title: 'Federation', data: "federation.slug" },
      { title: 'Club', data: "club.slug" },
    ],
    ajax: {
      url: `${environment.API.orient}/server_side/partners`,
    },
    actions: {
      buttons: [
        { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" },
        { action: "del", tooltip: "Remove", class: "btn-danger", icon: "mdi mdi-close" }
      ]
    }
  }

  constructor(
    public i18n: I18nService,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private federationsService: FederationsService,
    private confederationsService: ConfederationsService,
    private clubsService: ClubsService,
    private partnersService: PartnersService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.loadPartner();
    this.loadFederations();
    this.loadClubs();
    this.loadConfederations();
  }


  async loadFederations() {
    this.loadingService.show();
    let data = await this.federationsService.getFederations();
    this.arr_federations = data || [];
    this.loadingService.hide();
  }
  async loadConfederations() {
    this.loadingService.show();
    let data = await this.confederationsService.getConfederations();
    this.arr_confederations = data || [];
    this.loadingService.hide();
  }
  async loadClubs() {
    this.loadingService.show();
    let data = await this.clubsService.getClubs();
    this.arr_clubs = data || [];
    this.loadingService.hide();
  }

  /**
   * loadPartner: Método que busca as viaturas para o autocomplete.
   */
  async loadPartner() {
    this.loadingService.show();
    let data = await this.partnersService.getPartners();
    this.loadingService.hide();
    this.list_partners = (data || []).map(it => {
      it.label = [it.prefixo, it.placa].join(' - ');
      return it;
    });
  }

  handleTable(ev) {
    let map = {
      edit: () => {
        this.modalPartner.present();
        setTimeout(() => {
          this.PartnerForm.form.patchValue(ev.data);
        }, 400);
      },
      new: () => {
        this.modalPartner.present();
      },
      del: () => {
        this.partnersService.delPartner(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearPartnerForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.PartnerForm.value);
    this.partnersService.savePartner(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearPartnerForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearPartnerForm() {
    this.PartnerForm?.form.reset();
    this.closeModal();
    this.reloadTable.next(true);
  }

  closeModal() {
    this.modalPartner.dismiss();
  }

}
