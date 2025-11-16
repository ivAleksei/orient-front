import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { EventGpxsService } from 'src/apps/baseorient/_shared/providers/event-gpxs.service';

@Component({
  selector: 'app-event-gpxs',
  templateUrl: './event-gpxs.page.html',
  styleUrls: ['./event-gpxs.page.scss'],
})
export class EventGpxsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalEventGpx") modalEventGpx: any;
  @ViewChild('EventGpxForm') EventGpxForm: any;
  list_eventGpxs: any[] = [];

  tableInfo: any = {
    id: "table-event-gpxs",
    columns: [
      { title: 'Name', data: "name" },
    ],
    ajax: {
      url: `${environment.API.orient}/server_side/event-gpxs`,
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
    private eventGpxsService: EventGpxsService,
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
        this.modalEventGpx.present();
        setTimeout(() => {
          this.EventGpxForm.form.patchValue(ev.data);
        }, 400);
      },
      new: () => {
        this.modalEventGpx.present();
      },
      del: () => {
        this.eventGpxsService.delEventGpx(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearEventGpxForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    if (map[ev.action])
      return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.EventGpxForm.value);
    this.eventGpxsService.saveEventGpx(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearEventGpxForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearEventGpxForm() {
    this.EventGpxForm?.form.reset();
    this.closeModal();
    this.reloadTable.next(true);
  }

  closeModal() {
    this.modalEventGpx.dismiss();
  }

}
