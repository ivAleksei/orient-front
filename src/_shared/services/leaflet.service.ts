import { Injectable } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertsService } from './alerts.service';
import { LocationService } from './location.service';

declare var L: any;

@Injectable({
  providedIn: 'root'
})
export class LeafLetService {
  markers: any = [];
  dark: boolean = false;

  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  mobile: boolean = false;
  public initialized: boolean = false;

  public map: any;


  constructor(
    private nav: NavController,
    private locationService: LocationService,
    private alertsService: AlertsService,
    private platform: Platform,
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(false);
    this.watch = this._watch.asObservable();

    this.locationService.watch.subscribe(ev => {
      if (ev) this.init();
    })
  }

  async init() {
    if (this.initialized) return;

    await this.platform.ready();
    this.mobile = (this.platform.is('cordova') || this.platform.is('capacitor'));

    return Promise.resolve(true)
      .then(start => {
        if (this.mobile) return this.setupMobile();

        return this.setupBrowser();
      })
      .catch(err => {
        // console.log(err);
        return;
      })
  }

  setupMobile() {
    console.log('setupMobile');
    return this.initialized;
  }

  async setupBrowser() {
    if (L)
      this.initialized = true;

    return this.initialized;
  }

  toggleDarkMode(center) {
    // this.dark = !this.dark;
    // let mapOptions = Object.assign(this.MAP_OPTIONS, { center: center });
    // mapOptions.styles = this.dark ? this.DARK_SETTINGS : [];
    // this.map.setOptions(mapOptions);
  }

  setMarkers(markers, map) {
    // try {
    //   this.markers.map(m => {
    //     m.setMap(null);
    //     return m;
    //   })
    //   this.markers = (markers || []).map((m, i) => {
    //     let point = new google.maps.Marker(Object.assign({}, m, { map: map }));
    //     point.setClickable(false);
    //     if (m.done) m.setMap(null);

    //     return point;
    //   });

    //   return this.markers;
    // } catch (err) {

    // }
  }
}