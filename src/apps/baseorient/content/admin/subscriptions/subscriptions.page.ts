import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { SubscriptionsService } from 'src/apps/baseorient/_shared/providers/subscriptions.service';
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
      { title: 'Num Start', data: "num_start" },
      { title: 'Name', data: "name" },
      {
        title: 'Club', data: "club.name", render: (a, b, c) => {
          return [c.club?.slug, c.club?.name].filter(k => k).join(' - ')
        }
      },
      { title: 'Category', data: "category.name" },
    ],
    ajax: {
      url: `${environment.API.orient}/server_side/event-subscriptions`,
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
    private subscriptionsService: SubscriptionsService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.loadSubscription();
  }

  /**
   * loadSubscription: Método que busca as viaturas para o autocomplete.
   */
  async loadSubscription() {
    this.loadingService.show();
    let data = await this.subscriptionsService.getSubscriptions();
    this.loadingService.hide();
    this.list_subscriptions = (data || []).map(it => {
      it.label = [it.prefixo, it.placa].join(' - ');
      return it;
    });
  }

  handleTable(ev) {
    let map = {
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
        this.subscriptionsService.delSubscription(ev.data)
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
    this.subscriptionsService.saveSubscription(obj)
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
