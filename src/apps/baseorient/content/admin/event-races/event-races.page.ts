import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import moment from 'moment';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { EventRacesService } from 'src/apps/baseorient/_shared/providers/event-races.service';
import { EventsService } from 'src/apps/baseorient/_shared/providers/events.service';
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
  list_events: any[] = [];
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
    private eventsService: EventsService,
    private eventRacesService: EventRacesService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.getEvents();
  }

  async getEvents() {
    let data = await this.eventsService.getEvents({}, `
      _id
      dt_start
      name
    `);
    this.list_events = (data || []).sort((a: any, b: any) => b.dt_start > a.dt_start ? 1 : -1);
  }

  handleTable(ev) {
    let map = {
      edit: () => {
        this.modalEventRace.present();
        setTimeout(() => {
          let obj = Object.assign({}, ev.data);
          obj.time_start = moment(obj?.dt_start).format('HH:mm');
          obj.dt_start = moment(obj?.dt_start).format('YYYY-MM-DD');
          this.EventRaceForm.form.patchValue(obj || {});
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
    obj.dt_start = [obj.dt_start, obj.time_start].join(' ');
    delete obj.time_start;

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
