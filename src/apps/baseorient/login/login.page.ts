import { Component, ViewChild } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { environment } from 'src/apps/sisbom_web/environments/environment';
import { AppLoadingStrategy } from 'src/apps/sisbom_web/app-loading-strategy';

import { UserService } from 'src/apps/sisbom_web/_shared/providers/user.service';
import { AlertsService } from 'src/_shared/services/alerts.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  constructor() {

  }


}
