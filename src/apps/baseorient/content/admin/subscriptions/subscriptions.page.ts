import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { EventCategoriesService } from 'src/apps/baseorient/_shared/providers/event-categories.service';
import { EventRacesService } from 'src/apps/baseorient/_shared/providers/event-races.service';
import { EventSubscriptionsService } from 'src/apps/baseorient/_shared/providers/event-subscriptions.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.page.html',
  styleUrls: ['./subscriptions.page.scss'],
})
export class SubscriptionsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalSubscription") modalSubscription: any;
  @ViewChild('SubscriptionForm') SubscriptionForm: any;
  list_races: any[] = [];
  list_categories: any[] = [];
  arr_categories: any[] = [];

  tableInfo: any = {
    id: "table-subscriptions",
    columns: [
      { title: 'Num Start', data: "startnumber" },
      { title: 'Name', data: "name" },
      { title: 'Category', data: "category" },
      { title: 'Race', data: "race" },
      { title: 'Club', data: "club" },
      { title: 'Control', data: "controlcard" },
      {
        title: 'Pos', data: "pos", render: (a, b, c) => {
          return c.pos || c.status;
        }
      },
    ],
    ajax: {
      url: `${environment.API.orient}/server_side/event-subscriptions`,
    },
    actions: {
      buttons: [
        { action: "replay", tooltip: "Replay", class: "btn-info", icon: "mdi mdi-play" }, // TODO
        { action: "event-detail", tooltip: "Evento", class: "btn-light", icon: "mdi mdi-file-document" }, // TODO
        { action: "result", tooltip: "Extrato", class: "btn-warning", icon: "mdi mdi-file-document" }, // TODO
      ]
    }
  }

  constructor(
    public i18n: I18nService,
    private nav: NavController,
    private utils: UtilsService,
    private eventRacesService: EventRacesService,
    private subscriptionsService: EventSubscriptionsService,
    private eventCategoriesService: EventCategoriesService,
    private loadingService: LoadingService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.getRaces();
    this.getCategories();
  }

  async getRaces() {
    let data = await this.eventRacesService.getEventRaces({}, `
      _event
      name
      dt_start
      event{
        _id
        name
      }  
    `);
    this.list_races = data || [];
  }

  async getCategories() {
    let data = await this.eventCategoriesService.getEventCategories({}, `
      _event
      _race
      name
    `);
    this.list_categories = data || [];
  }


  handleTable(ev) {
    let map = {
      replay: args => this.nav.navigateForward(['/internal/replay'], {
        state: {
          _subscription: ev.data._id
        }
      }),
      ['event-detail']: args => this.nav.navigateForward(['/internal/admin/event', ev.data._event]),
      result: args => this.nav.navigateForward(['/internal/admin/result', ev.data._id]),
      edit: () => {
        this.modalSubscription.present();
        setTimeout(() => {
          this.SubscriptionForm.form.patchValue(ev.data);
        }, 400);
      },
      new: () => {
        this.modalSubscription.present();
      },
      del: () => {
        return Promise.resolve(null)
          // this.subscriptionsService.delSubscription(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearSubscriptionForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.SubscriptionForm.value);
    return this.subscriptionsService.saveEventSubscription(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearSubscriptionForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearSubscriptionForm() {
    this.SubscriptionForm?.form.reset();
    this.closeModal();
    this.reloadTable.next(true);
  }

  closeModal() {
    this.modalSubscription.dismiss();
  }

  setRace() {
    let obj = Object.assign({}, this.SubscriptionForm.value);
    let payload: any = {};
    payload._event = (this.list_races || []).find(it => it._id == obj._race)?._event || null;
    this.SubscriptionForm.form.patchValue(payload);
    this.arr_categories = (this.list_categories || []).filter(it => it._race == obj._race);
  }
  setCategory() {
    let obj = Object.assign({}, this.SubscriptionForm.value);
    let payload: any = {};
    if (obj._category)
      payload.category = (this.arr_categories || []).find(it => it._id == obj._category)?.name;
    this.SubscriptionForm.form.patchValue(payload);
  }
}
