import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../_shared/providers/user.service';
import { NavController, Platform } from '@ionic/angular';
import $ from 'jquery';
import { SocketService } from 'src/_shared/services/socket.service';
import { LocalStorageService } from 'src/_shared/services/local-storage.service';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { LoadingService } from 'src/_shared/services/loading.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { HttpService } from 'src/_shared/services/http.service';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import moment from 'moment';

import { NotificationsService } from 'src/apps/baseorient/_shared/providers/notifications.service';
import { BannersService } from 'src/apps/baseorient/_shared/providers/banners.service';

@Component({
  selector: 'app-internal',
  templateUrl: './internal.page.html',
  styleUrls: ['./internal.page.scss'],
})
export class InternalPage implements OnInit {
  @ViewChild("menuSidebar") menuSidebar: any;

  env: any = environment;
  force_chg: any = false;
  password: any;
  confirm_password: any;
  loading: any = false;

  mobile: any = false;
  person: any = {};
  user: any = {};
  
  menu_type: any = environment.menu_type;
  menu: any = [];
  mod: any = {};

  show_banners: any;
  banners: any = [];
  notifications: any = [];

  info_api: any;

  routerSub: Subscription;

  constructor(
    private http: HttpService,
    private bannersService: BannersService,
    private storage: LocalStorageService,
    private socket: SocketService,
    private nav: NavController,
    private platform: Platform,
    private userService: UserService,
    private loadingService: LoadingService,
    private screenOrientation: ScreenOrientation,
    public router: Router,
    public notificationsService: NotificationsService
  ) {
    this.notificationsService.watch.subscribe(ev => {
      this.getNotifications();
    })
    this.userService.watch.subscribe(ev => {
      this.setupMenu();
    })
    this.routerSub = router.events.pipe().subscribe((e: any) => {
      if (e instanceof NavigationStart) {
        this.checkPermission(e.url)
        this.closeMenus();
      }
    });

    this.typeMenu();
  }

  logNavigation(route) {
    this.mobile = (this.platform.is('iphone') || this.platform.is('android')) && !this.platform.is('mobileweb');
    let url = [environment.API.url, 'ws', 'log-navigation'].join('/');
    this.http.post(url, {
      route: route,
      device: this.mobile ? 'mobile' : 'desktop'
    })
  }

  async ionViewWillEnter() {
    this.getData();
  }

  async checkPermission(route) {
    if (!environment.production || !route.startsWith('/internal')) return;

    let find = (this.menu || []).find(m => {
      if (m.str_rota && route.startsWith(m.str_rota)) return m;
      return (m.submenu || []).find(p => {
        if (p.str_rota && route.startsWith(p.str_rota)) return p;
      })
    });

    if (!find)
      return this.userService.logOut();
  }

  closeMenus() {
    // MINIMIZE SIDEBAR
    this.mod = {};
    for (let it of this.menu)
      it.open = false;

    if (this.menuSidebar)
      this.menuSidebar.close();

    $('.header-submenu').removeClass('in');
    $('.notifications-menu').removeClass('in');
    $('.top-menu').removeClass('in');
  }

  typeMenu() {
    this.menu_type = innerWidth <= 768 ? environment.menu_type : "desktop";
    window.addEventListener('resize', () => {
      this.menu_type = innerWidth <= 768 ? environment.menu_type : "desktop";
    })
  }

  ngOnInit() {
    let env = environment.production ? 'production' : 'development';
    this.socket.start(env);
    this.screenOrientation.onChange().subscribe(() => this.closeMenus());
  }

  ngOnDestroy() {
    if (!this.routerSub?.closed)
      this.routerSub.unsubscribe();
  }



  ionViewDidEnter() {
    this.menuSidebar?.ionDidClose.subscribe(ev => {
      this.closeMenus();
    });

    this.checkChangePassword();
  }


  async getData() {
    this.getEnvironmentAPI();
    await this.getUser();

    this.setupMenu();
    this.getNotifications();
    this.getBanners();
  }

  async getBanners() {
    let last_see_banners = await this.storage.get('last_see_banners');
    if (last_see_banners && moment().isSame(moment(last_see_banners), 'day')) return;

    let banners = await this.bannersService.getBanners()
    this.banners = (banners || []).sort((a, b) => b.tipo > a.tipo ? 1 : -1);

    if (this.banners?.length)
      this.show_banners = true;
  }

  setSeeBanners() {
    this.show_banners = false;
    this.storage.set('last_see_banners', moment().format())
  }


  async checkChangePassword() {
    let chg_password = await this.storage.get('_change_password');
    let tmp_pass = await this.storage.get('tmp_pass');

    if (chg_password || tmp_pass) {
      this.force_chg = true;
      this.openModalPassword();
    }
  }

  async getUser() {
    let user = await this.userService.getUser();
    if (!user) return this.userService.logOut();

    if (user && !user.img) user.img = '/assets/imgs/avatar.jpeg';
    this.user = user || {};
  }

  async getNotifications() {
    let notifications = await this.notificationsService.getNotificationsUnread()
    this.notifications = (notifications || []);
  }

  routeNotifications() {
    this.nav.navigateForward("/internal/notifications");
    $('.notifications-menu').removeClass('in');
  }

  side_mode: boolean = false;

  async setupMenu() {
    this.person = await this.storage.get('person');
    let user = await this.storage.get('user');

    if (user?.menu?.length > 13)
      this.side_mode = true;

    this.menu = (user?.menu || []);
  }

  toggleMenu(it, ev?) {
    if (!it.submenu) {
      this.routeMenu(it);
    } else {
      it.open = !it.open;
      for (let m of this.menu)
        m.open = m._id == it._id && it.open;

      if (it.open) {
        if (ev) $('.header-submenu').css({ left: ev.target.offsetLeft });
        this.mod = it;
      } else {
        this.mod = {};
      }
    }
  }

  toggleNotifications() {
    let open = $('.notifications-menu').hasClass('in');
    this.closeMenus();
    if (!open)
      $('.notifications-menu').toggleClass('in');
  }

  openNotify(not: any) {
    this.notificationsService.openNotify(not);
    this.notifications = (this.notifications || []).filter(it => it._id != not._id)
    $('.notifications-menu').removeClass('in');
  }

  toggleTopMenu() {
    let open = $('.top-menu').hasClass('in');
    this.closeMenus();
    if (!open)
      $('.top-menu').toggleClass('in');
  }


  routeMenu(pg) {
    if (!pg || pg.bo_desabilitado) return;
    this.closeMenus();
    this.nav.navigateForward(pg.str_rota);
  }

  logout() {
    this.closeMenus();
    $('.top-menu').removeClass('in');

    this.userService.logOut();
  }

  async editProfile() {
    this.closeMenus();
    $('.top-menu').removeClass('in');
    this.nav.navigateForward(`/internal/profile/`);
  }


  // UPD PASSWORD

  modalPassword: boolean = false;

  async openModalPassword(obj?: any) {
    if (!obj) obj = {};
    $('.top-menu').removeClass('in');

    this.modalPassword = true;
  }

  async updPassword() {
    let _id = await this.storage.get('user_id');

    let payload = {
      _id: _id,
      password: this.password
    }

    this.userService.updPassword(payload)
      .then(done => {
        if (done?.str_cpf)
          this.clearUpdPassword();
      })
  }

  async clearUpdPassword() {
    this.password = null;
    this.confirm_password = null;
    this.modalPassword = false;
    this.force_chg = false;
    await this.storage.remove('_change_password');

    return;
  }




  async getEnvironmentAPI() {
    let url = [environment.API.url, 'ws', 'env'].join('/');
    this.info_api = await this.http.get(url);
  }


  async about() {
    this.nav.navigateForward('/internal/about');
    this.closeMenus();
  }

  openUrl(url) {
    if (!url) return;

    window.open(url, '_blank');
  }
}
