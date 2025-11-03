import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  _storage: any;
  constructor() {
    this._storage = {
      list: () => Object.keys(localStorage || {}),
      get: (k: string) => localStorage.getItem(k),
      set: (k: string, v: any) => localStorage.setItem(k, v),
      remove: (k: string) => localStorage.removeItem(k),
      clear: () => localStorage.clear()
    }
  }

  async list() {
    let data = this._storage.list();
    if (!data) return null;
    return data || [];
  }

  async get(key: string,) {
    let data = this._storage.get(key);
    if (!data) return null;

    if (String(data) == 'undefined'){
      await this.remove(key);
      return null;
    }

    return JSON.parse(data);
  }

  async set(key: string, data: any) {
    let value = JSON.stringify(data);
    return this._storage.set(key, value);
  }

  async remove(key: string) {
    return this._storage.remove(key);
  }

  async clear() {
    return this._storage.clear();
  }
}
