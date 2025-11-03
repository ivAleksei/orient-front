import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpService } from 'src/_shared/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class BannersService {


  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  constructor(
    public sanitizer: DomSanitizer,
    private loadingService: LoadingService,
    private alertsService: AlertsService,
    private http: HttpService,
    private graphql: GraphqlService
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(false);
    this.watch = this._watch.asObservable();
  }
  trigger() {
    this._watch.next(true);
  }


  async getBanners(args?: any) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      query Banners($todos: Boolean){
        Banners(todos: $todos){
          _id
          url
          tipo
          img{
            url
          }
          pdf{
            url
          }
          dt_inicio
          dt_fim
        }
      }`,
      name: "Banners",
      variables: args || {}
    }).then(data => {
      return (data || []).map(it => {
        if (it?.pdf) it.pdf = this.sanitizer.bypassSecurityTrustResourceUrl(`${it.pdf}#toolbar=0&navpanes=0`);
        return it;
      });
    })
  }

  newBanner(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation CreateBanner($input: BannerInput){
        CreateBanner(input: $input){
          data{
            _id
          }
          status
          msg
        }
      }`,
      name: "CreateBanner",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editBanner(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation UpdateBanner($input: BannerInput){
        UpdateBanner(input: $input){
          data{
            _id
          }
          status
          msg
        }
      }`,

      name: "UpdateBanner",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delBanner(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.url, 'graphql', {
          query: `
        mutation deleteBanner($_id: ID){
          deleteBanner(_id: $_id){
          
            status
            msg
          }
        }`,
          name: "deleteBanner",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveBanner(data) {
    return this[data._id ? 'editBanner' : "newBanner"]({ input: data });
  }

  setInscricao(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation inscricaoBanner($input: BannerSubscriptionInput){
        inscricaoBanner(input: $input){
          status
          msg
        }
      }`,

      name: "inscricaoBanner",
      variables: { input: data }
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }
}