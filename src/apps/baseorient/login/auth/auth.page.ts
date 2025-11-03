import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { UserService } from 'src/apps/sisbom_web/_shared/providers/user.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { AppLoadingStrategy } from 'src/apps/sisbom_web/app-loading-strategy';
import { environment } from 'src/apps/sisbom_web/environments/environment';
import { LocalStorageService } from 'src/_shared/services/local-storage.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss']
})
export class AuthPage implements OnInit {

  production: any = environment.production;
  username: any;
  str_cpf: any;
  keep_login: any;
  password: any;
  loading: boolean = false;
  version: any = environment.version;

  @ViewChild("loginForm", {}) loginForm: any;

  constructor(
    private loader: AppLoadingStrategy,
    private alertsService: AlertsService,
    private userService: UserService,
    private storage: LocalStorageService,
    private menuCtrl: MenuController,
  ) {
    this.loader.preLoadRoute('Internal')
  }

  async ionViewWillEnter() {
    this.userService.clearData();
    await this.storage.set('home_page', '/login/auth');
  }

  ngOnInit(): void { }

  ionViewDidEnter() { }

  clear() {
    this.loginForm.form.reset();
    this.loading = false;
  }

  async login() {
    if (this.loading) return;

    let obj = Object.assign({}, this.loginForm.value);
    if (!obj.username && !obj.str_cpf) return;

    this.loading = true;
    try {
      $('.logo').addClass('hide');
      const done = await this.userService.signIn(obj);
      $('.logo').removeClass('hide');
      this.loading = false;
      if (done)
        this.clear();
    } catch (err) {
      this.loading = false;
      this.alertsService.notify({ type: "error", subtitle: 'Não conseguimos acessar no momento. Tente novamente em alguns instantes.' });
    }
  }

  enterEv(ev) {
    if (ev.keyCode == 13)
      this.login();
  }
}
