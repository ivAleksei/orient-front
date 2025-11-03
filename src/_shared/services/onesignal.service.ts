import { Injectable } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertsService } from './alerts.service';
// import { NotificationsService } from '../providers/notifications.service';

declare var window: any;

@Injectable({
    providedIn: 'root'
})
export class OneSignalService {

    private _watch: BehaviorSubject<any>;
    public watch: Observable<any>;

    mobile: boolean = false;
    initialized: boolean = false;
    environment: any;

    public OneSignal: any;

    lib: any = {
        loaded: false,
        src: "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
    };


    constructor(
        private nav: NavController,
        private alertsService: AlertsService,
        private platform: Platform,
        private OneSignalMobile: OneSignal,
        // private NotificationsService: NotificationsService,
    ) {
        this._watch = <BehaviorSubject<any>>new BehaviorSubject(false);
        this.watch = this._watch.asObservable();
    }

    async start(environment) {
        return;
        if (!environment.production || this.initialized) return;
        this.environment = environment;

        await this.platform.ready();
        this.mobile = (this.platform.is('iphone') || this.platform.is('android')) && !this.platform.is('mobileweb');

        return Promise.resolve(true)
            .then(start => {
                if (this.mobile) return this.setupMobile();

                return this.setupBrowser();
            })
            .then(done => {
                this.OneSignal.Slidedown.promptPush();
            })
            .catch(err => {
                return;
            })
    }

    setupMobile() {
        // OneSignalMobile
    }

    async setupBrowser() {
        await this.platform.ready();

        let perm = await Notification.requestPermission();
        if (perm === 'granted') {
            // REMOVIDO
            // this.alertsService.notify({
            //     type: "success",
            //     subtitle: "As notificações são permitidas pelo usuário"
            // })
        } else {
            this.alertsService.notify({
                type: "warning",
                subtitle: "As notificações não são permitidas pelo usuário"
            })
        }

        await this.loadCdnScript();

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push((OneSignal) => {
            OneSignal.init({
                appId: this.environment.oneSignal.appId,
            });

            OneSignal.User.PushSubscription.id;

            this.OneSignal = OneSignal;
        });
        this.initialized = true;
        this._watch.next(true);
    }

    loadCdnScript() {
        return new Promise((resolve, reject) => {
            if (this.lib.loaded) {
                resolve(true);
            } else {
                let script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = this.lib.src;

                script.onload = () => {
                    this.lib.loaded = true;

                    resolve(true);
                };

                script.onerror = () => {
                    reject(false);
                };

                document.getElementsByTagName('head')[0].appendChild(script);
            }
        });
    }

    async sendTags(tags) {
        if (!this.initialized) return;

        if (this.initialized) {
            if (this.mobile) {

            } else {
                await this.OneSignal.User.addTags(tags);
            }
        }
        return true;
    }
}