import { Injectable } from '@angular/core';
import { Manager } from "socket.io-client";
import { LocalStorageService } from 'src/_shared/services/local-storage.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { NotificationsService } from 'src/apps/baseorient/_shared/providers/notifications.service';
import { PersonsService } from 'src/apps/baseorient/_shared/providers/persons.service';
import { UserService } from 'src/apps/baseorient/_shared/providers/user.service';


@Injectable({
  providedIn: 'root'
})
export class SocketService {

  manager: any;
  socket: any;
  platformSocket: any;
  subscriptions: any = {};

  constructor(
    private alertsService: AlertsService,
    private userService: UserService,
    private personsService: PersonsService,
    private notificationsService: NotificationsService,
    private storage: LocalStorageService
  ) {

  }

  start(endpoint?) {
    
    // SD ALEKSEI - 2025-09-05
    // TODO: SE NÃO FOR PRODUÇÃO RETORNA POR QUE ESTÁ RETORNANDO ERRO DE CORS, VERIFICAR DEPOIS
    if(!environment.production) 
      return;
    

    if (navigator.onLine) {
      // console.log('socket');
      try {
        this.manager = new Manager(environment.Socket.url);
        this.platformSocket = this.manager.socket(`/${environment.Socket.platform}-${endpoint}`);
        this.platformSocket.on('event', (ev) => this.handleEvent(ev));
      } catch (error) {
        // console.log(error);

        this.alertsService.notify({
          type: "warning",
          msg: "",
          title: "Sem Conexão"
        })
      }
    }
  }

  close(endpoint?) {
    if (this.subscriptions[endpoint]) {
      this.subscriptions[endpoint].disconnect();
      delete this.subscriptions[endpoint];
    }
  }

  async handleEvent(ev: any) {
    let _id = await this.storage.get('user_id');
    if (!environment.production)
      console.log(_id, ev);

    if (ev.data) {
      if (ev.data._user && ev.data._user != _id) return;
      if (ev.data._institution && ev.data._institution != _id) return;
    }

    try {
      switch (ev.table_obj) {
        case 'users':
          if (ev.data?._id == _id)
            this.userService.setUser();
            break;
        case 'militar':
          this.personsService.trigger();
          break;
        case 'notifications':
          if (ev.data?.users?.some(u => u == _id))
            this.notificationsService.trigger();
          break;
        default:
          console.log(`handle not defined to table:`, ev.table_obj);
          break;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
