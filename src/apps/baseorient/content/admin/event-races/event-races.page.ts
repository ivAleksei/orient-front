import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { EventRacesService } from 'src/apps/baseorient/_shared/providers/event-races.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Component({
  selector: 'app-event-races',
  templateUrl: './event-races.page.html',
  styleUrls: ['./event-races.page.scss'],
})
export class EventRacesPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalEventRace") modalEventRace: any;
  @ViewChild('EventRaceForm') EventRaceForm: any;
  list_eventRaces: any[] = [];

  tableInfo: any = {
    id: "table-event-races",
    columns: [
      { title: 'date', data: "dt_start", datatype: "pipe", pipe: "DatePipe", options: "DD/MM/YYYY HH:mm" },
      { title: 'name', data: "name" },
      { title: '_helga', data: "_helga" },
    ],
    ajax: {
      url: `${environment.API.orient}/server_side/event-races`,
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
    private eventRacesService: EventRacesService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.loadEventRace();
  }

  /**
   * loadEventRace: Método que busca as viaturas para o autocomplete.
   */
  async loadEventRace() {
    this.loadingService.show();
    let data = await this.eventRacesService.getEventRaces();
    this.loadingService.hide();
  }

  handleTable(ev) {
    let map = {
      edit: () => {
        this.modalEventRace.present();
        setTimeout(() => {
          this.EventRaceForm.form.patchValue(ev.data);
        }, 400);
      },
      new: () => {
        this.modalEventRace.present();
      },
      del: () => {
        this.eventRacesService.delEventRace(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearEventRaceForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    if (map[ev.action])
      return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.EventRaceForm.value);
    this.eventRacesService.saveEventRace(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearEventRaceForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearEventRaceForm() {
    this.EventRaceForm?.form.reset();
    this.closeModal();
    this.reloadTable.next(true);
  }

  closeModal() {
    this.modalEventRace.dismiss();
  }

}
