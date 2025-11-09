import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import moment from 'moment';
import $ from 'jquery';

import { register } from 'swiper/element/bundle';
import { environment } from 'src/apps/baseorient/environments/environment';
import { HttpService } from 'src/_shared/services/http.service';
import { LocalStorageService } from 'src/_shared/services/local-storage.service';
import { LocationService } from 'src/_shared/services/location.service';
import { OneSignalService } from 'src/_shared/services/onesignal.service';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  mobile: any = false;

  constructor(
    private http: HttpService,
    private platform: Platform,
    private locationService: LocationService,
    private oneSignalService: OneSignalService,
    private storage: LocalStorageService,
  ) {
    moment.locale('pt-br');

    this.setupApp();
    this.checkVersionUpdate();
  }
  
  async setupApp() {
    await this.platform.ready();
    await this.checkSSL();

    this.mobile = (this.platform.is('iphone') || this.platform.is('android')) && !this.platform.is('mobileweb');
    this.locationService.start(environment);
    this.oneSignalService.start(environment);
  }

  async checkSSL() {
    if (environment.production && location.protocol != 'https:') {
      location.href = location.href.replace(location.protocol, 'https:');
    }
  }

  async checkVersionUpdate() {
    if (!environment.production) return;
    let data = await this.http.pureGet([environment.portal.url, 'revision'].join('/'));
    let last_rev = await this.storage.get('_rev');
    if (!last_rev || last_rev != data?.revision) {
      await this.storage.set('_rev', data?.revision);
      location.href = `${location.href}?t=${data?.revision}`;
    }
  }
}
