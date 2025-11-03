import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { NavController } from '@ionic/angular';
import { LocalStorageService } from 'src/_shared/services/local-storage.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { AlertsService } from 'src/_shared/services/alerts.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  constructor(
    private storage: LocalStorageService,
    private nav: NavController,
    private alertsService: AlertsService,
    private loadingService: LoadingService,
    private graphql: GraphqlService
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(false);
    this.watch = this._watch.asObservable();
  }

  trigger() {
    this._watch.next(true);
  }

  async openNotify(it) {
    await this.setRead(it);
    this.nav.navigateForward(it.url);
  }

  async setRead(args) {
    args._person = await this.storage.get('user_id');
    this.loadingService.show();
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation read_Notification($_id: ID, $_person: ID){
        read_Notification(_id:$_id, _person: $_person){
          _id
        }
      }`,
      name: "read_Notification",
      variables: args || {}
    })
      .then(data => {
        this.loadingService.hide();
        return data;
      });
  }

  async getNotifications(args) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      query Notifications($_person: ID){
        Notifications(_person:$_person){
          _id
          title
          text
          url
          updated_at
          created_at
        }
      }`,
      name: "Notifications",
      variables: args || {}
    });
  }

  async getNotificationsUnread(args: any = {}) {
    args._person = await this.storage.get('user_id');
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      query NotificationsUnread($_person: ID){
        NotificationsUnread(_person:$_person){
          _id
          title
          text
          url
          created_at
          updated_at
        }
      }`,
      name: "NotificationsUnread",
      variables: args || {}
    });
  }

  async getNotificationsById(_id) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      query NotificationById($_id: ID){
        NotificationById(_id: $_id){
          _id
          title
          text
          url
          updated_at
          created_at
          route
        }
      }`,
      name: "NotificationById",
      variables: { _id: _id }
    });
  }

  async detail(it?, _id?) {
    if (_id) it = await this.getNotificationsById(_id);
    this.alertsService.ask({
      message: it.text,
      header: it.title,
      buttons: [{ id: "redirect", label: "Abrir Página" }, { id: "cancel", label: "OK" }]
    }).then(action => {
      if (action == 'redirect')
        this.nav.navigateForward(it.url);
    });
  }

}