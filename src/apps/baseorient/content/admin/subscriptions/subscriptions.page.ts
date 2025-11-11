import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
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
  list_subscriptions: any[] = [];

  tableInfo: any = {
    id: "table-subscriptions",
    columns: [
      { title: 'Date', data: "event.dt_start", datatype: "pipe", pipe: "DatePipe", options:"DD/MM/YYYY HH:mm" },
      { title: 'Num Start', data: "num_start" },
      { title: 'Name', data: "name" },
      { title: 'Category', data: "category.name" },
      {
        title: 'Club', data: "club.name", render: (a, b, c) => {
          return [c.club?.slug, c.club?.name].filter(k => k).join(' - ')
        }
      },
      { title: 'Evento', data: "event.name" },
    ],
    ajax: {
      url: `${environment.API.orient}/server_side/event-subscriptions`,
    },
    actions: {
      buttons: [
        { action: "event-detail", tooltip: "Evento", class: "btn-light", icon: "mdi mdi-file-document" }, // TODO
        { action: "result", tooltip: "Extrato", class: "btn-warning", icon: "mdi mdi-file-document" }, // TODO
        // { action: "edit", tooltip: "Editar", class: "btn-warning", icon: "mdi mdi-file-document" },
        // { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" },
        // { action: "del", tooltip: "Remove", class: "btn-danger", icon: "mdi mdi-close" }
      ]
    }
  }

  constructor(
    public i18n: I18nService,
    private nav: NavController,
    private utils: UtilsService,
    private loadingService: LoadingService,
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
    return Promise.resolve(null)
      // this.subscriptionsService.saveSubscription(obj)
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

}
