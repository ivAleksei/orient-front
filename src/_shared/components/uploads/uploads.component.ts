import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { v1 as uuid } from 'uuid';

@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.scss'],
})
export class UploadsComponent implements OnInit {
  @Output() public changeEv: EventEmitter<any> = new EventEmitter();
  @Input() configs: any;

  @Input() inputs: any;
  @Input() multiple: any;
  @Input() clear: any;
  @Input() filesInput: any;
  @Input() trigger: any;
  @ViewChild("selectMethod", { read: ElementRef }) selectMethod: any;

  files: any = [];
  mobile: any;
  _id: any = uuid();

  filesSub: Subscription;
  clearSub: Subscription;
  triggerSub: Subscription;

  methods: any = [
    { text: "Direto do PC", data: { action: 'desktop' } },
    // { text: "Enviar do Celular", data: { action: 'mobile' } }
  ];

  constructor(
    private utils: UtilsService,
    private platform: Platform,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
    this.mobile = (this.platform.is('iphone') || this.platform.is('android'));

    if (this.filesInput)
      this.filesSub = this.filesInput.subscribe((ev) => {
        this.setFiles(ev)
      });
    if (this.clear)
      this.clearSub = this.clear.subscribe((ev) => this.clearData());
    if (this.trigger)
      this.triggerSub = this.trigger.subscribe((ev) => this.selectMethods());

    this.files = this.configs?.files || []
  }

  ngOnDestroy() {
    if (!this.triggerSub?.closed)
      this.triggerSub?.unsubscribe();
    if (!this.filesSub?.closed)
      this.filesSub?.unsubscribe();
    if (!this.clearSub?.closed)
      this.clearSub?.unsubscribe();
  }

  setFiles(data) {
    this.files = data || [];
  }

  handleAction(action: string, file?: any) {
    let map = {
      'new': () => this.filesInput.click(),
      'select': ev => {
        let files: File[] = Array.from(ev.target?.files);
        for (let file of files) {
          if (this.utils.validFile(file)) {
            if (this.multiple) {
              this.files = [...this.files, file];
            } else {
              this.files = [file];
            }
            ev.target.value = '';
            this.triggerEvent()
          } else {
            this.alertsService.notify({ type: "warning", subtitle: "Falha na seleção de arquivo." })
          }
        }
      },
      'click': _f => {
        _f.open = !_f.open;
      },
      'remove': _f => {
        this.files = (this.files || []).filter(_f => _f != file);
      },
      'open': _f => {
        window.open(_f._path || _f.url, '_blank')
      }
    }
    return map[action](file);
  }

  triggerEvent() {
    this.changeEv.next(this.files);
  }

  clearData() {
    this.files = [];
  }

  chooseMethod(ev) {
    let data = Object.assign({}, ev?.detail?.data);
    if (!data?.action) return;

    let map = {
      'desktop': () => {
        $(`#${this._id}`).click();
      },
      'mobile': () => {
        this.openModal();
      }
    }
    return map[data?.action]();
  }

  selectMethods() {
    this.methods = [
      { text: "Direto do PC", data: { action: 'desktop' } },
      { text: "Enviar do Celular", data: { action: 'mobile' } }
    ].filter(it => !this.inputs?.length || this.inputs.includes(it.data.action));

    if (this.methods?.length == 1)
      return this.chooseMethod({ detail: { data: this.methods[0].data } });

    if (this.mobile) {
      window.open(this.configs.url, '_self')
    } else {
      this.selectMethod.nativeElement.present();
    }
  }

  copyClipboard() {
    this.utils.copyToClipboard(this.configs.url);
  }

  openModal() {

    $(`#modal-${this._id}`).addClass('in');
  }
  closeModal() {
    if (this.mobile) {
      window.close();
    } else {
      $(`#modal-${this._id}`).removeClass('in');
    }
  }
}
