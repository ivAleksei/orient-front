import { Component, OnInit, Input, Output, ViewChild, EventEmitter, TemplateRef } from "@angular/core";
import { DatePipe } from "../../pipes/date.pipe";
import { CurrencyPipe } from "../../pipes/currency.pipe";
import { Subject, Subscription } from "rxjs";
import { DataTableDirective } from "angular-datatables";
import { CustomFormatPipe } from "../../pipes/custom-format.pipe";
import { StatusPipe } from "../../pipes/status.pipe";
import { LocalStorageService } from "src/_shared/services/local-storage.service";
import { UtilsService } from "../../services/utils.service";
import { AlertsService } from "src/_shared/services/alerts.service";
import { PickerController } from "@ionic/angular";
import { ObjKeyPipe } from "src/_shared/pipes/obj-key.pipe";
import { PatentePipe } from "src/_shared/pipes/patente.pipe";
import { TimePipe } from "src/_shared/pipes/time.pipe";
declare var $: any;

@Component({
  selector: "data-table",
  templateUrl: "./data-table.component.html",
  styleUrls: ["./data-table.component.scss"]
})
export class DataTableComponent implements OnInit {

  dtTrigger: any = new Subject();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;

  reloadSub: Subscription;

  @Input() reload: any;
  @Input() listTemplate: TemplateRef<any>;
  @Input() tableInfo: any = {};

  @Output() public clickEvent: EventEmitter<any> = new EventEmitter();
  @Output() public switchEvent: EventEmitter<any> = new EventEmitter();
  @Output() public loadEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private pickerCtrl: PickerController,
    private utils: UtilsService,
    private storage: LocalStorageService,
    private alertsService: AlertsService,
    private TimePipe: TimePipe,
    private StatusPipe: StatusPipe,
    private PatentePipe: PatentePipe,
    private ObjKeyPipe: ObjKeyPipe,
    private CustomFormatPipe: CustomFormatPipe,
    private CurrencyPipe: CurrencyPipe,
    private DatePipe: DatePipe,
  ) {
    this.tableInfo.id = "temp-id";
  }

  list: any = [];
  buttons: any = {
    left: [],
    right: []
  }
  data: any = [];
  loading: boolean = false;
  last_page: number;

  languageCustom: any = {
    decimal: "",
    emptyTable: "Não há registros correspondentes a esta busca",
    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
    infoEmpty: "Mostrando 0 a 0 de 0 registros",
    infoFiltered: "(filtrado de _MAX_ registros)",
    infoPostFix: "",
    thousands: ",",
    lengthMenu: "_MENU_ Resultados por página",
    loadingRecords: `Buscando registros ... `,
    processing: "Processando...",
    search: "Pesquisar:",
    zeroRecords: "Nenhum registro encontrado",
    paginate: {
      first: "<<",
      last: ">>",
      next: ">",
      previous: "<",
    },
    aria: {
      sortAscending: ": Ativar para ordenar coluna ascendente",
      sortDescending: ": Ativar para ordenar coluna descendente",
    },
  };

  dtOptions: any = {
    dom: `
    <'dataTables_row'lf>
    <'dataTables_row table_row't>
    <'dataTables_row'ip>
    `,
    stateSave: true,
    lengthMenu: [10, 25, 50, 100],
    paging: true,
    autoWidth: false,
    language: this.languageCustom,
    destroy: true,
    order: [[1, 'asc']],
    data: [],
    columns: [],
    initComplete: () => {
      this.setupEvents();
    },
  };

  tableInstance: any;

  ngOnInit() {
    this.setupTable();

    if (this.reload)
      this.reloadSub = this.reload.subscribe(async (event) => {
        this.setupSource();
        // let dtInstance = await this.dtElement.dtInstance;
        // // dtInstance.page(1).draw('page');
      });
  }

  ngOnDestroy() {
    if (this.reloadSub && !this.reloadSub.closed)
      this.reloadSub.unsubscribe();
  }

  async setupTable() {
    ($ as any).fn.dataTable.moment(this.utils.formatsDate);
    ($ as any).fn.dataTable.ext.errMode = "none";
    ($ as any).fn.DataTable.ext.pager.numbers_length = 4;

    await this.setOptions();
    await this.setColumns();
    this.setupSource();
  }


  setOptions() {
    this.dtOptions.language = Object.assign({}, this.languageCustom);

    if (this.tableInfo.lengthMenu)
      this.dtOptions.lengthMenu = this.tableInfo.lengthMenu;

    if (this.tableInfo.order)
      this.dtOptions.order = this.tableInfo.order;

    if (this.tableInfo.stateSave == "false")
      this.dtOptions.stateSave = false;
    if (this.tableInfo.paging == "false")
      this.dtOptions.paging = false;

    this.dtOptions.searching = this.tableInfo.searching || false;
    this.dtOptions.ordering = false;

    if (this.tableInfo.selectable)
      this.dtOptions.select = {
        style: "multi",
        selector: "td:first-child",
        info: false,
      };

    this.buttons = { left: [], right: [] };
    for (let btn of (this.tableInfo?.actions?.buttons || [])) {
      if (!btn.position) btn.position = 'right';
      this.buttons[btn.position].push(btn);
    }
  }

  setColumns() {
    return Promise.resolve(this.tableInfo.columns || [])
      .then((columns) => {
        let id_column: any = {
          title: "Id",
          data: "_id",
          className: "id_column",
        };

        return [id_column, ...columns];
      })
      .then((columns: DataTables.ColumnSettings[]) => {
        return (columns || []).map((c: any) => {
          c.defaultContent = c.defaultContent || "-";

          let map_column = {
            pipe: (c) => {
              c.render = (d, f, row) => {
                let content = this.utils.getObjContent(c.data, row);

                if (!content) return "-";

                let options = c.options;

                if (Array.isArray(c.options))
                  return this[c.pipe].transform(content, ...c.options);

                return this[c.pipe].transform(content, options);
              };
              return c;
            },
            switch: (c) => {
              c.render = (d, f, row) => {
                let value = this.utils.getObjContent(c.data, row);
                if (!value || value == '-') value = false;
                return `
                <label class="switch">
                  <input id="sw-${row._id}" prop="${c.data}" type="checkbox" ${value ? 'checked' : ''}>
                  <span class="slider round"></span>
                </label>
                    `;
              };
              return c;
            },
            render: (c) => c,
          };

          if (!map_column[c.datatype]) return c;

          return map_column[c.datatype](c);
        });
      })
      .then((columns: DataTables.ColumnSettings[]) => {
        let actions: any = this.tableInfo.actions;

        /**
         * {
         * conditional: true/false,
         * action: "Event action",
         * tooltip: "Tooltip text",
         * span: "",
         * icon: "",
         * class_icon: "Custom class icon",
         * },
         */

        if (!actions) return columns;
        return columns.concat([
          {
            title: 'Ações',
            orderable: false,
            // width: `${ actions.buttons.length * 80 } px`,
            className: `td-actions text-center ${actions.class || ""} `,
            data: (row) => {
              let html = "";
              actions.buttons.forEach((el) => {
                if (
                  (el.conditional && el.conditional(row)) ||
                  !el.conditional
                ) {


                  html += `<button class="btn ${el.class ? el.class + " " : ""}${el.action || ""}"
                   data-toggle="tooltip" data-placement="top" title="${el.tooltip || ""}">`;
                  if (el.span) {
                    html += `<span aria-hidden="true" class="${el.icon} ${el.class_icon || ""
                      }"></span>`;
                  } else {
                    html += `<i class="${el.icon} ${el.class_icon || ""}"></i>`;
                  }
                  html += `</button>`;
                }
              });
              return html;
            },
          },
        ]);
      })
      .then((columns) => {
        return this.dtOptions.columns = columns;

      })
      .then(done => {
        this.dtTrigger.next();
      });
  }

  setupSource() {
    if (this.tableInfo.ajax) {
      this.dtOptions.serverSide = true;
      this.setupAjaxHeaders();
    } else {
      this.dtOptions.data = this.tableInfo.data;
    }
    this.dtTrigger.next();
  }

  async setupAjaxHeaders() {
    let user = await this.storage.get('user_id');
    this.dtOptions.ajax = this.tableInfo.ajax;
    this.dtOptions.ajax.beforeSend = function (request) {
      request.setRequestHeader("Content-Type", "application/json");
      request.setRequestHeader("Access-Control-Allow-Origin", "*");
      request.setRequestHeader("x-access-user", user);
    };
  }

  async setupEvents() {
    let init = false;
    this.tableInstance = await this.dtElement.dtInstance;

    this.tableInstance.off('page')
    this.tableInstance.on("page", () => {
      var info = this.tableInstance.page.info();
      this.last_page = info.page;
    });
    this.tableInstance.off('xhr.dt')
    this.tableInstance.on("xhr.dt", (e, settings, json, xhr) => {
      this.list = json?.data || [];
    });

    this.tableInstance.off('draw')
    this.tableInstance.on("draw", (e, settings) => {
      this.clickEvents();
      init = true;
    });

    setTimeout(() => {
      if (!init)
        this.tableInstance.draw();
    }, 800);

  }

  async clickEvents() {
    if (!this.tableInfo?.actions?.buttons?.length) return;
    $(`#${this.tableInfo?.id} button `).off('click');
    $(`#${this.tableInfo?.id} button `).on('click', (e) => {
      let button = $(e.target).closest('button');
      let t_row = $(button).closest('tr')[0];
      let data = this.tableInstance.row(t_row).data();
      if (!data) {
        this.tableInstance.draw();
        return;
      }

      let attrClass = $(e.target.closest("button, a")).attr("class");
      let ev_action = "";
      if (attrClass) {
        let split = attrClass.split(" ");
        ev_action = attrClass ? split.slice(-1)[0] : "";
      }
      if (ev_action)
        this.clickEvent.emit({
          data: data,
          action: ev_action,
        });
    })

    $(`#${this.tableInfo?.id} .switch input `).off('click');
    $(`#${this.tableInfo?.id} .switch input`).on('click', (e) => {
      let target = e.target;
      if (!target || !target?.attributes?.prop) return;

      let data = {
        _id: e.target.id.replace(/^sw-/, ''),
        [e.target.attributes.prop.nodeValue]: e.target.checked ? 1 : 0
      }
      this.switchEvent.emit({
        data: data,
      });
    })

    if (window.innerWidth > 768) return;
    $(`#${this.tableInfo?.id} td`).off('click');
    $(`#${this.tableInfo?.id} td`).on('click', async (e) => {

      e.stopImmediatePropagation();
      e.preventDefault();
      let selector = $(e.target).closest('tr')[0];

      let data = this.tableInstance.row(selector).data();
      const picker = await this.pickerCtrl.create({
        columns: [
          {
            name: 'action',
            options: (this.tableInfo?.actions?.buttons || []).map(act => {
              return {
                text: act.tooltip,
                value: act.action
              }
            })
          },
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Selecionar',
            handler: (ev) => this.clickEvent.emit({ data: data, action: ev.action.value })
          },
        ],
      });

      await picker.present();
    })

  }
}
