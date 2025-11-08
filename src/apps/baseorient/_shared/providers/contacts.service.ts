import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
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

  async getContacts(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query Contacts{
        Contacts{
          _id
        }
      }`,
      name: "Contacts",
      variables: args || {}
    });
  }
  async getContactById(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query ContactById($_id: String){
        ContactById(_id: $_id){
          _id
        }
      }`,
      name: "ContactById",
      variables: args || {}
    });
  }

  newContact(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateContact($input: ContactInput){
        CreateContact(input: $input){
          status
          msg
        }
      }`,
      name: "CreateContact",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editContact(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateContact($input: ContactInput){
        UpdateContact(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateContact",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delContact(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteContact($_id: ID){
          deleteContact(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteContact",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveContact(data) {
    return this[data._id ? 'editContact' : "newContact"]({ input: data });
  }

}