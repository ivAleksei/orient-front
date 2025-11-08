import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { ClubsService } from 'src/apps/baseorient/_shared/providers/clubs.service';
import { ConfederationsService } from 'src/apps/baseorient/_shared/providers/confederations.service';
import { FederationsService } from 'src/apps/baseorient/_shared/providers/federations.service';
import { ResourcesService } from 'src/apps/baseorient/_shared/providers/resources.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Component({
  selector: 'app-club-form',
  templateUrl: './club-form.page.html',
  styleUrls: ['./club-form.page.scss'],
})
export class ClubFormPage implements OnInit {
  @ViewChild('ClubForm') ClubForm: any;

  @Input() _id: any;
  arr_confederations: any[] = [];
  arr_federations: any[] = [];
  arr_state_city: any[] = [];
  arr_city: any[] = [];

  constructor(
    public i18n: I18nService,
    private nav: NavController,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private confederationsService: ConfederationsService,
    private federationsService: FederationsService,
    private resourcesService: ResourcesService,
    private clubsService: ClubsService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
    this.getData();
  }

  async loadClubDetail() {
    if (!this._id) return;


    this.loadingService.show();
    let data = await this.clubsService.getClubById({ _id: this._id });
    this.ClubForm.form.patchValue(data || {});

    setTimeout(() => {
      this.setState();
    }, 200);
    this.loadingService.hide();
  }

  getData() {
    this.loadConfederations();
    this.loadFederations();
    this.loadState();
    this.loadClubDetail();
  }

  async loadConfederations() {
    this.loadingService.show();
    let data = await this.confederationsService.getConfederations();
    this.arr_confederations = (data || []);
    this.loadingService.hide();
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

  setState() {
    let obj = Object.assign({}, this.ClubForm.value);
    this.arr_city = (this.arr_state_city || []).find(it => it.sigla == obj.state)?.cidades || []; 
  }


  saveData() {
    this.loadingService.show();
    let obj = Object.assign({}, this.ClubForm.value);
    this.clubsService.saveClub(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

}
