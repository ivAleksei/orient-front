import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { EventsService } from 'src/apps/baseorient/_shared/providers/events.service';
import { NavController } from '@ionic/angular';
import moment from 'moment';
import { EventRacesService } from 'src/apps/baseorient/_shared/providers/event-races.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalImport") modalImport: any;
  @ViewChild('ImportForm') ImportForm: any;
  @ViewChild("modalEvent") modalEvent: any;
  @ViewChild('EventForm') EventForm: any;
  list_events: any[] = [];

  tableInfo: any = {
    id: "table-events",
    columns: [
      { title: 'date', data: "dt_start", datatype: "pipe", pipe: "DatePipe", options: "DD/MM/YYYY HH:mm" },
      { title: 'name', data: "name" },
      { title: '_helga', data: "_helga" },
    ],
    data: [],
    actions: {
      buttons: [
        { action: "sync", tooltip: "sync", class: "btn-warning", icon: "mdi mdi-sync" },
        { action: "detail", tooltip: "Detalhes", class: "btn-light", icon: "mdi mdi-newspaper" },
        { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" },
        { action: "newrace", tooltip: "Criar Prova", class: "btn-danger", icon: "mdi mdi-flag-checkered", conditional: args => !args.n_races },
        { action: "del", tooltip: "Remove", class: "btn-danger", icon: "mdi mdi-close" }
      ]
    }
  }

  constructor(
    public i18n: I18nService,
    private nav: NavController,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private eventRacesService: EventRacesService,
    private eventsService: EventsService,
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
      name
      dt_start
      location
      _helga
      n_races
    `);
    this.tableInfo.data = data || [];
    this.reloadTable.next(true)
  }


  handleTable(ev) {
    let map = {
      import_helga: () => this.modalImport.present(),
      edit: () => {
        this.modalEvent.present();
        setTimeout(() => {
          let obj = Object.assign({}, ev.data);
          obj.time_start = moment(obj?.dt_start, this.utils.formatsDate).format('HH:mm');
          obj.dt_start = moment(obj?.dt_start, this.utils.formatsDate).format('YYYY-MM-DD');
          this.EventForm.form.patchValue(obj || {});
        }, 400);
      },
      new: () => {
        this.modalEvent.present();
      },
      sync: () => this.eventsService.syncHelga(ev.data._helga),
      newrace: async () => {
        let confirm = await this.alertsService.askConfirmation(this.i18n.lang.NEW_EVENT_RACE, '...');
        if (confirm == 'false') return;

        console.log('cria prova');
        await this.eventRacesService.saveEventRace({ _event: ev.data._id, name: ev.data.name, dt_start: ev.data.dt_start })
          .then(data => {
            this.loadingService.hide();
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

            this.clearEventForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
          });
      },
      detail: () => {
        this.nav.navigateForward(['/internal/admin/event/', ev.data._id]);
      },
      del: () => {
        this.eventsService.delEvent(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearEventForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    return map[ev.action](ev.data);
  }

  async importEvent() {
    this.loadingService.show();
    let obj = Object.assign({}, this.ImportForm.value);
    await this.eventsService.syncHelga(obj._helga);
    this.clearEventForm();
    this.loadingService.hide();
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.EventForm.value);
    obj.dt_start = [obj.dt_start, obj.time_start].join(' ');
    delete obj.time_start;

    this.eventsService.saveEvent(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearEventForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearEventForm() {
    this.ImportForm?.form.reset();
    this.EventForm?.form.reset();
    this.closeModal();
    this.getEvents();
  }

  closeModal() {
    this.modalImport?.dismiss();
    this.modalEvent?.dismiss();
  }

}
