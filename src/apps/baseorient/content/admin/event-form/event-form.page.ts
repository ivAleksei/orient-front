import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import moment from 'moment';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { ClubsService } from 'src/apps/baseorient/_shared/providers/clubs.service';
import { EventsService } from 'src/apps/baseorient/_shared/providers/events.service';
import { FederationsService } from 'src/apps/baseorient/_shared/providers/federations.service';
import { ResourcesService } from 'src/apps/baseorient/_shared/providers/resources.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.page.html',
  styleUrls: ['./event-form.page.scss'],
})
export class EventFormPage implements OnInit {
  @ViewChild('EventForm') EventForm: any;

  @Input() _id: any;
  arr_federations: any[] = [];
  arr_clubs: any[] = [];
  arr_events: any[] = [];
  arr_state_city: any[] = [];
  arr_city: any[] = [];

  constructor(
    public i18n: I18nService,
    private nav: NavController,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private resourcesService: ResourcesService,
    private federationsService: FederationsService,
    private clubsService: ClubsService,
    private eventsService: EventsService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
    this.getData();
  }

  async loadEventDetail() {
    if (!this._id) return;


    this.loadingService.show();
    let data = await this.eventsService.getEventById({ _id: this._id });

    // HANDLE DT_START
    data.time_start = moment(data.dt_start, this.utils.formatsDate).format('HH:mm');
    data.dt_start = moment(data.dt_start, this.utils.formatsDate).format('YYYY-MM-DD');

    this.EventForm.form.patchValue(data || {});

    setTimeout(() => {
      this.setState();
    }, 200);
    this.loadingService.hide();
  }

  getData() {
    this.loadEventDetail();
    this.loadState();
    this.loadFederations();
    this.loadClubs();
  }

  async loadClubs() {
    this.loadingService.show();
    let data = await this.clubsService.getClubs();
    this.arr_clubs = (data || []);
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
    let obj = Object.assign({}, this.EventForm.value);
    this.arr_city = (this.arr_state_city || []).find(it => it.sigla == obj.state)?.cidades || [];
  }

  saveData() {
    this.loadingService.show();
    let obj = Object.assign({}, this.EventForm.value);

    // HANDLE DT_START
    obj.dt_start = moment([obj.dt_start, obj.time_start].join(' '), 'YYYY-MM-DD HH:mm').format();
    delete obj.time_start;

    this.eventsService.saveEvent(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

}
