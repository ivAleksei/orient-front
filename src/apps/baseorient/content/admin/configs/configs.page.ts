import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { ConfigsService } from 'src/apps/baseorient/_shared/providers/configs.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Component({
  selector: 'app-configs',
  templateUrl: './configs.page.html',
  styleUrls: ['./configs.page.scss'],
})
export class ConfigsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalConfig") modalConfig: any;
  @ViewChild('ConfigForm') ConfigForm: any;
  list_configs: any[] = [];

  tableInfo: any = {
    id: "table-configs",
    columns: [
      { title: 'Name', data: "name" },
    ],
    ajax: {
      url: `${environment.API.orient}/server_side/configs`,
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
    private configsService: ConfigsService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.loadConfig();
  }

  /**
   * loadConfig: Método que busca as viaturas para o autocomplete.
   */
  async loadConfig() {
    this.loadingService.show();
    let data = await this.configsService.getConfigs();
    this.loadingService.hide();
    this.list_configs = (data || []).map(it => {
      it.label = [it.prefixo, it.placa].join(' - ');
      return it;
    });
  }

  handleTable(ev) {
    let map = {
      edit: () => {
        this.modalConfig.present();
        setTimeout(() => {
          this.ConfigForm.form.patchValue(ev.data);
        }, 400);
      },
      new: () => {
        this.modalConfig.present();
      },
      del: () => {
        this.configsService.delConfig(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearConfigForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.ConfigForm.value);
    this.configsService.saveConfig(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearConfigForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearConfigForm() {
    this.ConfigForm?.form.reset();
    this.closeModal();
    this.reloadTable.next(true);
  }

  closeModal() {
    this.modalConfig.dismiss();
  }

}
