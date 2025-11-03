import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LocalStorageService } from './local-storage.service';

import * as ptBR from 'src/assets/i18n/PT-BR.json';

@Injectable({
  providedIn: 'root'
})
export class I18nService {

  public _lang: any = 'PT-BR';
  public lang: any = ptBR;

  constructor(
    private storage: LocalStorageService,
    private http: HttpService
  ) {
    this.init();
  }

  async init() {
    let _lang = await this.storage.get('_lang');
    this._lang = _lang || 'PT-BR';
    await this.setLanguage();

    this.loadLanguages();
  }

  async loadLanguages() {
    let url = [environment.API.orient, 'ws', 'i18n'].join('/');
    let languages = await this.http.get(url);

    let keys = Object.keys(languages || {});
    await this.storage.set('i18n_langs', keys);
    for (let k of keys) {
      let obj_lang = await this.http.get(languages[k]);
      await this.storage.set(`i18n_${k}`, obj_lang);
      if (k == this._lang) this.lang = obj_lang;
    }
    await this.setLanguage();
  }

  async setLanguage(_lang?: string) {
    let person = await this.storage.get('person');
    _lang = _lang || person?.language || 'PT-BR';

    this._lang = _lang;
    await this.storage.set('_lang', this._lang);


    let lang = await this.storage.get(`i18n_${this._lang}`);
    if (lang) this.lang = lang;
  }
}
