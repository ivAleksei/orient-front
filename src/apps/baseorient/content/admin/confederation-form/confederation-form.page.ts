import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { ConfederationsService } from 'src/apps/baseorient/_shared/providers/confederations.service';
import { ResourcesService } from 'src/apps/baseorient/_shared/providers/resources.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Component({
  selector: 'app-confederation-form',
  templateUrl: './confederation-form.page.html',
  styleUrls: ['./confederation-form.page.scss'],
})
export class ConfederationFormPage implements OnInit {
  @ViewChild('ConfederationForm') ConfederationForm: any;

  @Input() _id: any;
  arr_confederations: any[] = [];
  arr_state_city: any[] = [];
  arr_city: any[] = [];

  constructor(
    public i18n: I18nService,
    private nav: NavController,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private resourcesService: ResourcesService,
    private confederationsService: ConfederationsService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
    this.getData();
  }

  async loadConfederationDetail() {
    if (!this._id) return;

    
    this.loadingService.show();
    let data = await this.confederationsService.getConfederationById({ _id: this._id });
    this.ConfederationForm.form.patchValue(data || {});
    
    setTimeout(() => {
      this.setState();
    }, 200);
    this.loadingService.hide();
  }

  getData() {
    this.loadConfederationDetail();
  }

  setState() {
    let obj = Object.assign({}, this.ConfederationForm.value);
    this.arr_city = (this.arr_state_city || []).find(it => it.sigla == obj.state)?.cidades || []; 
  }

  saveData() {
    this.loadingService.show();
    let obj = Object.assign({}, this.ConfederationForm.value);
    this.confederationsService.saveConfederation(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

}
