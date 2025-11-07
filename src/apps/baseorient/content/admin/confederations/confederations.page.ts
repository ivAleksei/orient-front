import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { ConfederationsService } from 'src/apps/baseorient/_shared/providers/confederations.service';

@Component({
  selector: 'app-confederations',
  templateUrl: './confederations.page.html',
  styleUrls: ['./confederations.page.scss'],
})
export class ConfederationsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalConfederation") modalConfederation: any;
  @ViewChild('ConfederationForm') ConfederationForm: any;

  tableInfo: any = {
    id: "table-confederations",
    columns: [
      { title: 'Country', data: "country" },
      { title: 'Slug', data: "slug" },
      { title: 'Name', data: "name" },
    ],
    ajax: {
      url: `${environment.API.orient}/server_side/confederations`,
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
    private confederationsService: ConfederationsService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
  }

  handleTable(ev) {
    let map = {
      edit: () => {
        this.modalConfederation.present();
        setTimeout(() => {
          this.ConfederationForm.form.patchValue(ev.data);
        }, 400);
      },
      new: () => {
        this.modalConfederation.present();
      },
      del: () => {
        this.confederationsService.delConfederation(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearConfederationForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.ConfederationForm.value);
    this.confederationsService.saveConfederation(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearConfederationForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearConfederationForm() {
    this.ConfederationForm?.form.reset();
    this.closeModal();
    this.reloadTable.next(true);
  }

  closeModal() {
    this.modalConfederation.dismiss();
  }

}
