import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class BlanksService {
  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  constructor(
    private loadingService: LoadingService,
    private alertsService: AlertsService,
    private graphql: GraphqlService
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(false);
    this.watch = this._watch.asObservable();
  }
  trigger() {
    this._watch.next(true);
  }

  async getBlanks(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query Blanks{
        Blanks{
          _id
        }
      }`,
      name: "Blanks",
      variables: args || {}
    });
  }
  async getBlankById(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query BlankById($_id: String){
        BlankById(_id: $_id){
          _id
        }
      }`,
      name: "BlankById",
      variables: args || {}
    });
  }

  newBlank(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateBlank($input: BlankInput){
        CreateBlank(input: $input){
          status
          msg
        }
      }`,
      name: "CreateBlank",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editBlank(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateBlank($input: BlankInput){
        UpdateBlank(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateBlank",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delBlank(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteBlank($_id: ID){
          deleteBlank(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteBlank",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveBlank(data) {
    return this[data._id ? 'editBlank' : "newBlank"]({ input: data });
  }

}