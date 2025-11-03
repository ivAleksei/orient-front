import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { Platform } from '@ionic/angular';
import { Network } from '@awesome-cordova-plugins/network/ngx';

@Injectable({
  providedIn: "root",
})
export class StatusConnectionService {

  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  public status: boolean = true;

  constructor(
    private platform: Platform,
    private network: Network

  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(this.status);
    this.watch = this._watch.asObservable();
    /**
     * SE FOR NECESSÁRIO A PUBLICAÇÃO DE UM APP 
     * VERIFICAR AQUI A CONDIÇÃO PARA USO DO CORDOVA
     */
    // if (!browser) {
    //   console.log(this.network.type && this.network.type != 'none');

    // this.setStatus(this.network.type && this.network.type != 'none');

    // this.network.onConnect().subscribe(() => this.setStatus(true));
    // this.network.onDisconnect().subscribe(() => this.setStatus(false));
    // } else {
    (window as any).addEventListener("online", () => {
      this.setStatus(true);
    });
    (window as any).addEventListener("offline", () => {
      this.setStatus(false);
    });

    this.setStatus(navigator.onLine);
    // }
  }

  toggleConnection() {
    this.setStatus(!this.status);
  }

  getStatus() {
    return this.status;
  }

  setStatus(status) {
    if (this.status != status) {
      this.status = status;
      this._watch.next(this.status);
    }
  }
}
