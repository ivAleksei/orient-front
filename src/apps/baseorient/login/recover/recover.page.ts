import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { UserService } from 'src/apps/baseorient/_shared/providers/user.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { AppLoadingStrategy } from 'src/apps/baseorient/app-loading-strategy';
import { environment } from 'src/apps/baseorient/environments/environment';
import { I18nService } from 'src/_shared/services/i18n.service';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.page.html',
  styleUrls: ['./recover.page.scss'],
})
export class RecoverPage implements OnInit {

  email: any;
  loading: boolean = false;
  version: any = environment.version;

  @ViewChild("recoverForm", {}) recoverForm: any;

  constructor(
    public i18n: I18nService,
    private loader: AppLoadingStrategy,
    private alertsService: AlertsService,
    private userService: UserService,
    private menuCtrl: MenuController,
  ) {
    this.loader.preLoadRoute('Internal')
  }

  async ionViewWillEnter() {
    this.userService.clearData();
  }

  ngOnInit(): void { }

  ionViewDidEnter() { }

  clear() {
    this.recoverForm.form.reset();
    this.loading = false;
  }

  recover() {
    if (this.loading) return;
    this.loading = true;
    let obj = Object.assign({}, this.recoverForm.value);

    return this.userService.recover(obj)
      .then(done => {
        this.loading = false;
        if (done)
          this.clear();
      })
      .catch((err) => {
        this.loading = false;
        this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.TRY_AGAIN_LATER });
      });
  }

  enterEv(ev) {
    if (ev.keyCode == 13)
      this.recover();
  }
}
