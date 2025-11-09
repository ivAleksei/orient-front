import { Injectable } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { v1 as uuid } from 'uuid';
import moment from 'moment';
import md5 from 'md5';

import { AlertsService } from 'src/_shared/services/alerts.service';
import { LocalStorageService } from 'src/_shared/services/local-storage.service';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { StatusConnectionService } from 'src/_shared/services/status-connection.service';
import { NetworkInterface } from '@awesome-cordova-plugins/network-interface/ngx';

import { environment } from 'src/apps/baseorient/environments/environment';
import { UtilsService } from 'src/_shared/services/utils.service';
import { HttpService } from 'src/_shared/services/http.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { CustomFormatPipe } from 'src/_shared/pipes/custom-format.pipe';
import { OneSignalService } from 'src/_shared/services/onesignal.service';
import { PersonsService } from './persons.service';
import { I18nService } from 'src/_shared/services/i18n.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _watch: BehaviorSubject<any>;
  watch: Observable<any>;

  private _clear: BehaviorSubject<any>;
  clear: Observable<any>;

  constructor(
    private i18n: I18nService,
    private networkInterface: NetworkInterface,
    private CustomFormatPipe: CustomFormatPipe,
    private graphql: GraphqlService,
    private http: HttpService,
    private platform: Platform,
    private nav: NavController,
    private utils: UtilsService,
    private storage: LocalStorageService,
    private OneSignalService: OneSignalService,
    private personsService: PersonsService,
    private alertsService: AlertsService,
    private StatusConn: StatusConnectionService,
    private loadingService: LoadingService,
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(null);
    this.watch = this._watch.asObservable();

    this._clear = <BehaviorSubject<any>>new BehaviorSubject(null);
    this.clear = this._clear.asObservable();

    this.setUserLogged();
  }

  async setUserLogged() {
    let _id = await this.storage.get('user_id');
    if (_id) this.setUser();
  }

  getUser() {
    return this.storage.get('user');
  }

  getPerson() {
    return this.storage.get('person');
  }

  async loginAuth(form) {
    let data = await this.graphql.query(environment.API.orient, 'auth', {
      query: `
    mutation login($str_cpf: String, $password: String){
      login(str_cpf: $str_cpf, password: $password){
        _id
        str_cpf
      }
    }`,
      name: "login",
      variables: {
        str_cpf: form.str_cpf,
        password: form.password
      }
    });

    return data;
  }

  async signIn(form) {
    if (!this.StatusConn.status)
      return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.LOGIN_NO_CONNECTION });

    if (environment.production && ((!form.username && !form.str_cpf) || !form.password)) {
      this.alertsService.notify({ type: "warning", subtitle: this.i18n.lang.LOGIN_MISSING_DATA });
      return null;
    }

    if (form.password == 'mudar123') {
      await this.storage.set('_change_password', true);
    } else {
      await this.storage.remove('_change_password');
    }

    let notAllowed = () => {
      this.alertsService.notify({ type: "warning", subtitle: this.i18n.lang.LOGIN_USER_PASSWORD_DIFF });
      this.loadingService.hide();
      return null;
    }

    return Promise.resolve(true)
      .then(async start => {
        await this.loadingService.show();

        form.password = md5(form.password);

        let data = await this.graphql.query(environment.API.auth, 'auth', {
          query: `
        mutation Login($username: String, $password: String){
          Login(username: $username, password: $password){
            _id
            token
          }
        }`,
          name: "Login",
          variables: form
        });
        if (!data || !data.token) return notAllowed();
        await this.storage.set('user_id', data._id);
        await this.storage.set('_token', data.token);
        await this.setUser();
        // await this.logAccess();

        // this.setTagsOneSignal();
        this.redirect();

        return data;
      })
      .catch((err) => {
        return null;
      });
  }

  async setTagsOneSignal() {
    let person = await this.storage.get('person');
    if (!person) return;
    let tags: any = {
      matricula: person.str_matricula
    }

    if (person._id)
      tags._id = person._id;

    return this.OneSignalService.sendTags(tags);
  }

  async setUser() {
    // INFO USER
    let _user = await this.storage.get('user_id');

    let user = await this.graphql.query(environment.API.auth, 'graphql', {
      query: `
      query UserInfo($_id: ID){
        UserInfo(_id: $_id){
          _id
          menu
          _permissions
        }
      }`,
      name: "UserInfo",
      variables: {
        _id: _user
      }
    });
    if (!user) return this.logOut();

    user.menu = JSON.parse(user.menu || "[]");

    await this.storage.set('user', user);

    let obj_permissions = {};
    for (let it of (user._permissions || []))
      obj_permissions[it] = 1;

    sessionStorage.setItem("_permissions", JSON.stringify(obj_permissions));

    // INFO MILITAR
    let person = await this.personsService.getPersonInfo(user._id, `
      name
      short_name
    `);
    await this.storage.set('person', person);

    this._watch.next(true);
    return user;
  }

  async logAccess() {
    await this.platform.ready();
    let now = moment().format();
    let _id = await this.storage.get('user_id');
    if (!_id) return null;

    let device = (this.platform.is('android') || this.platform.is('ios')) ? 'mobile' : 'desktop';
    let body: any = { _id: _id, device: device };

    return this.graphql.post(environment.API.orient, 'graphql', {
      query: `
            mutation LogAccess($_id: ID, $device: String){
              LogAccess(_id: $_id, device: $device)
            }`,
      name: "LogAccess",
      variables: body
    }).then(done => {
      if (!done) return;

      this.storage.set('last_log_access', body);
      return true;
    });
  }


  async redirect() {
    // RETORNO DE PAGINA
    let page_return = await this.storage.get('_return_page');
    await this.storage.remove('_return_page');

    this.loadingService.hide();
    if (page_return)
      return this.nav.navigateForward(page_return);

    // REDIRECT INTERNO
    let route = '/internal/home';
    return this.nav.navigateForward(route);
  }

  async logOut() {
    await this.clearData();
    return this.nav.navigateRoot("/login");
  }

  async clearData() {
    await this.storage.set('home_page', '/login');
    await this.storage.remove('__return_page');
    await this.storage.remove('__plate');
    await this.storage.remove('_token');
    await this.storage.remove('_change_password');
    await this.storage.remove('person');
    await this.storage.remove('keep_login');
    await this.storage.remove('user_id');
    await this.storage.remove('person_id');
    await this.storage.remove('last_log_access');
    await this.storage.remove('profiles');
    await this.storage.remove('tmp_pass');
    await this.storage.remove('user');


    let tablesInfo = (await this.storage.list()).filter(k => k.startsWith('DataTables'));
    await this.utils.loopArrayPromise(tablesInfo, async t => this.storage.remove(t));

    this._clear.next(true);
  }

  async recover(args) {
    this.loadingService.show();
    return this.graphql.post(environment.API.orient, 'auth', {
      query: `
      mutation Recover($email: String){
        Recover(email: $email)
      }`,
      name: "Recover",
      variables: args
    }).then(data => {
      this.loadingService.hide();
      return data;
    })
  }

  async updPassword(args) {
    this.loadingService.show();
    return this.graphql.post(environment.API.admin, 'graphql', {
      query: `
      mutation UpdPassword($_id: ID, $password: String){
        UpdPassword(_id: $_id, password: $password){
          status
        }
      }`,
      name: "UpdPassword",
      variables: args
    }).then(data => {
      this.loadingService.hide();
      return data;
    })
  }
}


