import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLoadingStrategy } from './app-loading-strategy';

import { HttpService } from 'src/_shared/services/http.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { ComponentsModule } from 'src/_shared/components/components.module';
import { UtilsService } from 'src/_shared/services/utils.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NetworkInterface } from '@awesome-cordova-plugins/network-interface/ngx';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { ToastrModule } from 'ngx-toastr';
import { PipesModule } from 'src/_shared/pipes/pipes.module';
import { LocationService } from 'src/_shared/services/location.service';
import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    HttpClientModule,
    BrowserAnimationsModule,
    ComponentsModule,
    PipesModule,
    AppRoutingModule,
    ToastrModule.forRoot({
      positionClass: window.innerWidth < 768 ? 'toast-bottom-right' : 'toast-top-right'
    }),
    FullCalendarModule
  ],
  providers: [
    AppLoadingStrategy,
    HTTP,
    HttpService,
    Geolocation,
    LocationService,
    NetworkInterface,
    Network,
    OneSignal,
    ScreenOrientation,
    UtilsService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
