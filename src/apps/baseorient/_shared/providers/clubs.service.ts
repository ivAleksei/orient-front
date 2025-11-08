import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class ClubsService {
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

  async getClubs(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query Clubs{
        Clubs{
          _id
          slug
          name
        }
      }`,
      name: "Clubs",
      variables: args || {}
    });
  }
  async getClubById(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query ClubById($_id: ID){
        ClubById(_id: $_id){
          _id
          _federation
          _confederation
          slug
          name
          state
          city
          country
        }
      }`,
      name: "ClubById",
      variables: args || {}
    });
  }

  newClub(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateClub($input: ClubInput){
        CreateClub(input: $input){
          status
          msg
        }
      }`,
      name: "CreateClub",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editClub(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateClub($input: ClubInput){
        UpdateClub(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateClub",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delClub(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteClub($_id: ID){
          deleteClub(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteClub",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveClub(data) {
    return this[data._id ? 'editClub' : "newClub"]({ input: data });
  }

}