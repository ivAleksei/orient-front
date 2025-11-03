import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'src/_shared/services/local-storage.service';
import { UserService } from 'src/apps/baseorient/_shared/providers/user.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {

  constructor(
    private nav: NavController,
    private userService: UserService,
    private storage: LocalStorageService
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {

    let home_page;

    let return_page = await this.storage.get('__return_page');
    if (return_page) {
      home_page = return_page;
      await this.storage.remove('__return_page');
      this.nav.navigateForward(home_page);
    }

    // else {
    //   home_page = '/login';
    //   let welc_set = await this.storage.get('__welcome_set');
    //   if (welc_set) home_page = '/login';

    let user_id = await this.storage.get('user_id');
    if (user_id) {
      //     let keep_login = await this.storage.get('keep_login');
      //     if (keep_login) {
      home_page = '/internal';
      await this.storage.set('home_page', home_page);
      this.nav.navigateForward(home_page);
    } else {
      this.userService.clearData();
      home_page = '/login';
      this.nav.navigateForward(home_page);
    }
    // }

    //   console.log(window.location.hash, home_page);
    // await this.storage.set('home_page', home_page);
    // }

  }
}
