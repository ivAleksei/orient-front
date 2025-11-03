import { Injectable } from "@angular/core";
import { Geolocation } from "@awesome-cordova-plugins/geolocation/ngx";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { Platform } from "@ionic/angular";
import { AlertsService } from "./alerts.service";

declare var navigator: any;

@Injectable({
  providedIn: "root",
})
export class LocationService {

  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  initialized: boolean = false;
  public location: any = {
    lat: null,
    lng: null,
  };

  mobile: any = false;
  lost_location: any = false;
  configs: any = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 30 * 1000,
  };

  geoSubscription: any;

  constructor(
    private alertsService: AlertsService,
    private geolocation: Geolocation,
    private platform: Platform
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(null);
    this.watch = this._watch.asObservable();
  }

  async stop() {
    if (this.mobile) {

    } else {
      if (this.geoSubscription)
        navigator.geolocation.clearWatch(this.geoSubscription);
    }
  }

  async start(environment?) {
    return this.platform.ready()
      .then(ready => {
        this.mobile = (this.platform.is('cordova') || this.platform.is('capacitor'));
        if (this.mobile) return this.setupMobile();

        return this.setupBrowser(environment);
      }).catch(err => {
        this.alertsService.notify({ type: "error", subtitle: err?.message || err });
        this.setLocation(null, 'err start');
      })
  }

  async getCurrentLocation() {
    return this.location;
  }

  async setupBrowser(environment?) {
    if (environment.production && location.protocol == 'http:') {
      this.showError({ message: "O plugin de geolocalização apenas funciona sob o protocolo https." })
      return this.setLocation(null, 'err http');
    }

    let result = await navigator.permissions.query({ name: "geolocation" });
    if (!navigator?.geolocation || result?.state === "denied") {
      return this.setLocation(null, 'A');
    }

    navigator.geolocation.getCurrentPosition(
      (data: any) => this.setLocation(data?.coords || null, 'B'), // ON SUCCESS
      err => this.showError(err), // ON ERROR
      this.configs); // CONFIGS
  }

  async watchPosition() {
    if (!this.geoSubscription)
      if (this.mobile) {
        this.geoSubscription = this.geolocation.watchPosition(this.configs).subscribe((data: any) => {
          if (!data?.coords) return this.setLocation(null, 'C');

          return this.setLocation(data?.coords || null, 'mobile.geoSubscription');
        });
      } else {
        this.geoSubscription = navigator.geolocation.watchPosition((data: any) => this.setLocation(data?.coords || null, 'C'), err => this.showError(err), this.configs);
      }
  }

  async setupMobile() {
    let data: any = await this.geolocation.getCurrentPosition(this.configs);
    if (!data?.coords) return this.setLocation(null, 'A');

    this.setLocation(data?.coords || null, 'setupMobile');

  }

  setLocation(coords, local?) {
    if (coords?.latitude == this.location?.lat && coords?.longitude == this.location?.lng) return;

    // console.log(local, coords);

    this.location = {
      lat: coords?.latitude || null,
      lng: coords?.longitude || null,
      altitude: coords?.altitude || null
    };


    if (coords?.latitude) {
      this.lost_location = false;
    } else {
      if (!this.lost_location) {
        this.lost_location = true;
      }
    }
    this._watch.next(true);
    return this.location;
  }

  showError(error) {
    if (!error?.code)
      return this.alertsService.notify({ type: "warning", subtitle: error?.message });

    switch (error?.code) {
      case error.PERMISSION_DENIED:
        this.alertsService.notify({ type: "warning", subtitle: "O acesso à Geolocalização foi negado pelo usuário." });
        break;
      case error.POSITION_UNAVAILABLE:
        this.alertsService.notify({ type: "warning", subtitle: "A informação de Geolocalização não está disponível." });
        break;
      case error.TIMEOUT:
        this.alertsService.notify({ type: "warning", subtitle: "O tempo de resposta de requisição da Geolocalização expirou." });
        break;
      case error.UNKNOWN_ERROR:
        this.alertsService.notify({ type: "warning", subtitle: "Houve erro desconhecido, tente novamente em alguns instantes." });
        break;
      default:
    }
  }
}
