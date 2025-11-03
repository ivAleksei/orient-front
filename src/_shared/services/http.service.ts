import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { HTTP } from "@awesome-cordova-plugins/http/ngx";
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from 'src/_shared/services/local-storage.service';
import { LocationService } from './location.service';
import { AlertsService } from 'src/_shared/services/alerts.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  mobile: boolean = false;
  http: any;

  constructor(
    private alertsService: AlertsService,
    private locationService: LocationService,
    private storage: LocalStorageService,
    private platform: Platform,
    private httpBrowser: HttpClient,
    private httpNative: HTTP,
  ) {
    this.platform.ready()
      .then(done => {
        let mobile = (this.platform.is('iphone') || this.platform.is('android')) && !this.platform.is('mobileweb');
        /**
         * SE FOR NECESSÁRIO A PUBLICAÇÃO DE UM APP 
         * VERIFICAR AQUI A CONDIÇÃO PARA USO DO CORDOVA
         */

        if (mobile) {
          this.http = this.httpNative;
          this.mobile = true;
        } else {
          this.http = this.httpBrowser;
          this.mobile = false;
        }
      })
  }


  async getHeaders(json?) {
    let location = await this.locationService.location;
    let token_frotas = await this.storage.get('_token_cbfrotas');
    let token_sisbom = await this.storage.get('_token_sisbom');

    let headers;

    headers = {};

    headers['Authorization'] = (token_sisbom || token_frotas) ? `Bearer ${token_sisbom || token_frotas}` : '';

    headers['Content-Type'] = 'application/json';
    headers["Access-Control-Allow-Origin"] = "*";
    headers['Accept'] = 'application/json';
    headers['Location-Latitude'] = location?.latitude || '';
    headers['Location-Longitude'] = location?.longitude || '';
    headers["Cache-Control"] =
      "no-cache, no-store, must-revalidate, post-check=0, pre-check=0";
    headers["Pragma"] = "no-cache";
    headers["Expires"] = "0";
    if (json) headers["Content-Type"] = "application/json";

    return headers;
  }

  getExternal(url) {
    return this.platform.ready()
      .then(async ready => {
        if (this.mobile) {

        } else {
          return this.http.get(url, {
            withCredentials: false,
          }).toPromise().then((res) => {
            try {
              return JSON.parse(res.text())
            } catch (error) {
              return res.text();
            }
          });
        }
      })
      .catch(err => {
        return null
      });
  }

  pureGet(url) {
    return this.platform.ready()
      .then(async ready => {
        if (this.mobile) {

        } else {
          return this.http.get(url, {
            withCredentials: false,
          }).toPromise();
        }
      })
      .catch(err => {
        return null
      });
  }

  get(url) {
    return this.platform.ready()
      .then(async ready => {
        if (this.mobile) {

        } else {
          let headers = await this.getHeaders(true);
          return this.http.get(url, {
            headers: headers,
            withCredentials: false,
          }).toPromise();
        }
      })
      .catch(err => {
        return null
      });
  }

  getWHeaders(url, headers) {
    return this.platform.ready()
      .then(async ready => {
        if (this.mobile) {

        } else {
          return this.http.get(url, {
            headers: headers,
            withCredentials: false,
          }).toPromise();
        }
      })
      .catch(err => {
        return null
      });
  }

  async post(url, body, files?) {
    return this.platform.ready()
      .then(async ready => {
        if (this.mobile) {

        } else {
          if (files) {
            let formData = new FormData();
            for (let k in body) {
              formData.append(k, body[k]);
            }
            for (let k in files) {
              formData.append(k, files[k], files[k].name);
            }

            let headers = await this.getHeaders();
            headers['Content-Type'] = 'multipart/form-data;';

            return this.http.post(url, formData).toPromise();

          } else {
            let headers = await this.getHeaders();
            return this.http.post(url, body, { headers: headers }).toPromise()
          }
        }
      })
      .then((json: any) => {
        if (json && json.errors) {
          let err = json.errors.find((e: any) => e);
          this.msgRetorno(url, err);
        }
        return json;
      })
      .catch(err => {
        if (err?.error?.message)
          this.alertsService.notify({ type: "error", title: "", subtitle: err?.error?.message });
        for (let e of (err?.error?.errors || []))
          this.alertsService.notify({ type: "error", title: "", subtitle: e?.message || e });

        return null
      });
  }

  postMultipart(url, body) {
    return this.platform.ready()
      .then(async ready => {
        if (this.mobile) {

        } else {
          let formData = new FormData();
          for (let k in body) {
            formData.append(k, body[k]);
          }
          let headers = await this.getHeaders();
          headers['Content-Type'] = 'multipart/form-data;';

          return this.http.post(url, formData).toPromise();
        }
      })
      .then((json: any) => {
        if (json && json.errors) {
          let err = json.errors.find((e: any) => e);
          this.msgRetorno(url, err);
        }
        return json;
      })
      .catch(err => {
        if (err?.error?.message)
          this.alertsService.notify({ type: "error", title: "", subtitle: err?.error?.message });
        for (let e of (err?.error?.errors || []))
          this.alertsService.notify({ type: "error", title: "", subtitle: e?.message || e });

        return null
      });
  }

  put(url, body) {
    return this.platform.ready()
      .then(async ready => {
        if (this.mobile) {

        } else {
          let headers = await this.getHeaders(true);
          return this.http.put(url, body, { headers: headers }).toPromise();
        }
      })
      .then((json: any) => {
        if (json && json.errors) {
          let err = json.errors.find((e: any) => e);
          this.msgRetorno(url, err);
        }
        return json;
      })
      .catch(err => {
        if (err?.error?.message)
          this.alertsService.notify({ type: "error", title: "", subtitle: err?.error?.message });
        for (let e of (err?.error?.errors || []))
          this.alertsService.notify({ type: "error", title: "", subtitle: e?.message || e });

        return null
      });
  }

  msgRetorno(url: string, err: any): any {
    var str: string = "";
    var typeMessage: string = "";

    typeMessage = "warning";
    str = err ? err.message : "";

    if (str) {
      this.alertsService.notify({
        title: "Ops...",
        subtitle: str,
        type: typeMessage
      });
    }
  }
}
