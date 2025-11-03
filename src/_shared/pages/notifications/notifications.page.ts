import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { NotificationsService } from 'src/apps/cfap/_shared/providers/notifications.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { LocalStorageService } from 'src/_shared/services/local-storage.service';
import { environment } from 'src/apps/cfap/environments/environment';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();

  tableInfo: any;
  notifications: any = [];
  constructor(
    private alertsService: AlertsService,
    private nav: NavController,
    private route: ActivatedRoute,
    public notificationService: NotificationsService,
    private storage: LocalStorageService
  ) {
    this.route.queryParams.subscribe(query => {
      if (query?._id) this.detail(null, query._id)
    })
  }

  ngOnInit(): void { }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.loadNotifications();
    this.setTableInfo();
  }

  async loadNotifications() {
    let _person = await this.storage.get('person_id');
    let data = await this.notificationService.getNotifications({ _person: _person });
    this.notifications = data || [];
  }


  async setTableInfo() {
    let _person = await this.storage.get('person_id');
    return Promise.resolve(true)
      .then(start => {

        this.tableInfo = {
          id: "table-notifications",
          searching: true,
          columns: [
            { title: 'Ult. Atualização', data: "updated_at", datatype: "pipe", pipe: "DatePipe", options: "DD/MM/YYYY HH:mm" },
            { title: 'Título', data: "title" },
          ],
          actions: {
            buttons: [
              {
                action: "open",
                tooltip: "Detalhe",
                class: "btn-info",
                icon: "mdi mdi-eye",
              },
              {
                action: "redirect",
                tooltip: "Redirecionar",
                class: "btn-light",
                icon: "mdi mdi-arrow-top-right",
                conditional: args => args.url
              }
            ],
          },
          ajax: {
            url: `${environment.API.url}/server_side/notifications${_person ? '?u=' + _person : ''}`,
          }
        };
      })
      .then(done => this.reloadTable.next(true))
  }

  handleTable(ev) {
    let handle = {
      open: (ev) => this.open(ev.data),
      detail: (ev) => this.detail(ev.data),
      redirect: (ev) => this.nav.navigateForward(ev.data.url)
    };

    if (!handle[ev.action]) return;

    return handle[ev.action](ev);
  }

  async open(it) {
    await this.notificationService.openNotify(it);
    if (window.location.hash.includes(it._id))
      this.detail(it);
  }

  async detail(it?, _id?) {
    if (_id) it = await this.notificationService.getNotificationsById(_id);
    this.alertsService.ask({
      message: it.text,
      header: it.title,
      buttons: [{ id: "redirect", label: "Abrir Página" }, { id: "cancel", label: "OK" }]
    }).then(action => this.handleTable({ action: action, data: it }));
  }

}
