import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { ClubsService } from 'src/apps/baseorient/_shared/providers/clubs.service';
import { ConfederationsService } from 'src/apps/baseorient/_shared/providers/confederations.service';
import { ContactsService } from 'src/apps/baseorient/_shared/providers/contacts.service';
import { FederationsService } from 'src/apps/baseorient/_shared/providers/federations.service';
import { PersonsService } from 'src/apps/baseorient/_shared/providers/persons.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {
  @Output() public inputEvent: EventEmitter<any> = new EventEmitter();
  @Output() public clearEvent: EventEmitter<any> = new EventEmitter();
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalContact") modalContact: any;
  @ViewChild('ContactForm') ContactForm: any;
  list_contacts: any[] = [];
  arr_federations: any[] = [];
  arr_confederations: any[] = [];
  arr_clubs: any[] = [];
  arr_persons: any[] = [];

  tableInfo: any = {
    id: "table-contacts",
    columns: [
      {
        title: 'Name', data: "person.name", render: (a, b, c) => {
          return [c.person?.name, c.person?.num_cbo].filter(k => k).join(' - ');
        }
      },
      { title: 'Position', data: "position" },
      { title: 'Confederation', data: "confederation.slug" },
      { title: 'Federation', data: "federation.slug" },
      { title: 'Club', data: "club.slug" },
    ],
    ajax: {
      url: `${environment.API.orient}/server_side/contacts`,
    },
    actions: {
      buttons: [
        { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" },
        { action: "del", tooltip: "Remove", class: "btn-danger", icon: "mdi mdi-close" }
      ]
    }
  }

  constructor(
    public i18n: I18nService,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private personsService: PersonsService,
    private contactsService: ContactsService,
    private federationsService: FederationsService,
    private confederationsService: ConfederationsService,
    private clubsService: ClubsService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.loadPersons();
    this.loadFederations();
    this.loadClubs();
    this.loadConfederations();
  }

  /**
   * loadFederations: Método que busca as viaturas para o autocomplete.
   */
  async loadPersons() {
    this.loadingService.show();
    let data = await this.personsService.getPersons();
    this.arr_persons = (data || []).map(it => {
      it.label = [it.name, it.num_cbo].filter(k => k).join(' - ');
      return it;
    });
    this.loadingService.hide();
  }
  async loadFederations() {
    this.loadingService.show();
    let data = await this.federationsService.getFederations();
    this.arr_federations = data || [];
    this.loadingService.hide();
  }
  async loadConfederations() {
    this.loadingService.show();
    let data = await this.confederationsService.getConfederations();
    this.arr_confederations = data || [];
    this.loadingService.hide();
  }
  async loadClubs() {
    this.loadingService.show();
    let data = await this.clubsService.getClubs();
    this.arr_clubs = data || [];
    this.loadingService.hide();
  }

  setPerson(ev: any) {
    this.ContactForm.form.patchValue({ _person: ev?._id || null, email: ev?.email || null, phone: ev?.phone || null })
  }

  handleTable(ev) {
    let map = {
      edit: () => {
        this.modalContact.present();
        setTimeout(() => {
          this.ContactForm.form.patchValue(ev.data);
          this.inputEvent.next(ev.data?._person);
        }, 400);
      },
      new: () => {
        this.modalContact.present();
      },
      del: () => {
        this.contactsService.delContact(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearContactForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.ContactForm.value);
    this.contactsService.saveContact(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearContactForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearContactForm() {
    this.ContactForm?.form.reset();
    this.closeModal();
    this.clearEvent.next(true);
    this.reloadTable.next(true);
  }

  closeModal() {
    this.modalContact.dismiss();
  }

}
