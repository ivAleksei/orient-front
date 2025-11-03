import { Injectable } from "@angular/core";
import { HttpService } from "src/_shared/services/http.service";

@Injectable({
  providedIn: "root",
})
export class GraphqlService {
  constructor(
    public HttpService: HttpService
  ) { }

  query(API_url: string, endpoint: string, payload: any, files?: any, url?: any): any {
    if (!url) url = API_url;

    let content = {
      variables: payload.variables,
      query: payload.query
    };

    return this.HttpService.post(url, content)
      .then((res) => (payload.name ? res.data[payload.name] : res.data))
      .catch(err => null)
    // .catch((res) => this.query(endpoint, payload));
  }

  post(API_url: string, endpoint: string, payload: any): any {
    let url = API_url;
    let content = {
      variables: payload.variables,
      query: payload.query,
    };

    return this.HttpService.post(url, content).then((res) => {
      if (!res) return null;

      return payload.name ? res.data[payload.name] : res.data;
    }).catch(err => {
      console.log(err);

      return null;
    });
  }
}
