import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { EventPcsService } from 'src/apps/baseorient/_shared/providers/event-pcs.service';

@Component({
  selector: 'app-event-pcs',
  templateUrl: './event-pcs.page.html',
  styleUrls: ['./event-pcs.page.scss'],
})
export class EventPcsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalEventPc") modalEventPc: any;
  @ViewChild('EventPcForm') EventPcForm: any;
  list_eventPcs: any[] = [];

  tableInfo: any = {
    id: "table-event-pcs",
    columns: [
      { title: 'Name', data: "name" },
    ],
    ajax: {
      url: `${environment.API.orient}/server_side/event-pcs`,
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
    private eventPcsService: EventPcsService,
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
        this.modalEventPc.present();
        setTimeout(() => {
          this.EventPcForm.form.patchValue(ev.data);
        }, 400);
      },
      new: () => {
        this.modalEventPc.present();
      },
      del: () => {
        this.eventPcsService.delEventPc(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearEventPcForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    if (map[ev.action])
      return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.EventPcForm.value);
    this.eventPcsService.saveEventPc(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearEventPcForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearEventPcForm() {
    this.EventPcForm?.form.reset();
    this.closeModal();
    this.reloadTable.next(true);
  }

  closeModal() {
    this.modalEventPc.dismiss();
  }

}
