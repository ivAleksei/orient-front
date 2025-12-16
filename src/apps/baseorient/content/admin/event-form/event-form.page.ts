import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import moment from 'moment';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { HttpService } from 'src/_shared/services/http.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { ClubsService } from 'src/apps/baseorient/_shared/providers/clubs.service';
import { ConfederationsService } from 'src/apps/baseorient/_shared/providers/confederations.service';
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
  @Output() public inputEvent: EventEmitter<any> = new EventEmitter();
  @Output() public clearEvent: EventEmitter<any> = new EventEmitter();

  @Input() _id: any;
  event: any;
  obj_organizer: any;
  arr_confederations: any[] = [];
  arr_federations: any[] = [];
  arr_clubs: any[] = [];
  arr_organizers: any[] = [];
  arr_events: any[] = [];
  arr_state_city: any[] = [];
  arr_city: any[] = [];

  constructor(
    public i18n: I18nService,
    private nav: NavController,
    private utils: UtilsService,
    private http: HttpService,
    private loadingService: LoadingService,
    private resourcesService: ResourcesService,
    private confederationsService: ConfederationsService,
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
    let data = await this.eventsService.getEventById({ _id: this._id }, `
      _helga
      dt_start
      banner{
        url
      }
      name
      location
      organizer
      _organizer{
        _id
        type
      }
    `);

    this.event = data || {};
    // HANDLE DT_START
    data.time_start = moment(data.dt_start, this.utils.formatsDate).format('HH:mm');
    data.dt_start = moment(data.dt_start, this.utils.formatsDate).format('YYYY-MM-DD');

    this.EventForm.form.patchValue(data || {});

    setTimeout(() => {
      this.setState();
    }, 200);

    this.setupListOrganizers();
    this.loadingService.hide();
  }

  getData() {
    this.loadEventDetail();
    this.loadState();
    this.loadConfederations();
    this.loadFederations();
    this.loadClubs();
  }

  setupListOrganizers() {
    this.arr_organizers = [
      ... (this.arr_confederations || []),
      ... (this.arr_federations || []),
      ... (this.arr_clubs || []),
    ].sort((a, b) => a.label > b.label ? 1 : -1);

    console.log(this.event);
    
    if (this.event?._organizer?._id)
      this.inputEvent.next(this.event._organizer?._id);
  }


  setOrganizer(ev: any) {
    this.EventForm.form.patchValue({ organizer: ev.label });
    this.obj_organizer = {
      _id: ev._id,
      type: ev.type
    }
    console.log(this.EventForm.value, this.obj_organizer);

  }


  async loadClubs() {
    let data = await this.clubsService.getClubs();
    this.arr_clubs = (data || []).map(it => {
      return Object.assign({ type: "club", label: [it.slug, it.name].filter(it => it).join(' - ') }, it);
    });
    this.setupListOrganizers();
  }

  async loadConfederations() {
    let data = await this.confederationsService.getConfederations();
    this.arr_confederations = (data || []).map(it => {
      return Object.assign({ type: "confederation", label: [it.slug, it.name].filter(it => it).join(' - ') }, it);
    });
    this.setupListOrganizers();
  }

  async loadFederations() {
    let data = await this.federationsService.getFederations();
    this.arr_federations = (data || []).map(it => {
      return Object.assign({ type: "federation", label: [it.slug, it.name].filter(it => it).join(' - ') }, it);
    });
    this.setupListOrganizers();
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

    obj._organizer = this.obj_organizer || null;

    this.eventsService.saveEvent(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }


  getFile(key) {
    $(`#input_${key}`).click();
  }

  async fileSelect(ev, prop) {
    let files = ev?.target?.files;
    if (!files || !files.length) return;


    let file = files[0];
    if (!file) return;

    let ext = file.name.split('.').slice(-1)[0];
    // valida formato e tamanho
    if (!['jpg', 'png', 'jpeg'].includes(ext)) {
      this.alertsService.notify({ type: "info", subtitle: 'Formato de arquivo não experado.' });
      return;
    }

    let base64 = await this.utils.getBase64(file)

    this.event[prop] = { url: base64 };

    this.loadingService.show();
    // UPLOAD FILES
    let url = [environment.API.storage, 'uploads', 'index.php'].join("/");
    let payload: any = { _id: this._id };

    let data_upl = await this.http.post(url, {
      id: this._id, folder: 'baseorient_events'
    }, { arquivo: file });

    if (data_upl?.err) {
      this.alertsService.notify({ type: "warning", subtitle: "Falha na seleção de arquivo." })
      return this.loadingService.hide();
    }

    payload.banner = data_upl || null;
    await this.eventsService.saveEvent(payload)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.loadEventDetail();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });

    ev.target.value = '';
  }
}
