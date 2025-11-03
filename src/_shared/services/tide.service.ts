import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import $ from 'jquery'
import { environment } from 'src/apps/sisbom_web/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TideService {

  constructor
    (

  ) { }

  getTideData(date) {
    return new Promise(resolve => {
      let url = [environment.API.url, 'ws', 'tide_table', date].join('/');
      $.ajax({
        url: url,
        dataType: 'json'
      }).done((data) => resolve(data || []));
    })
  }
}