import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { HttpService } from 'src/_shared/services/http.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/sisbom_web/environments/environment';
import { v1 as uuid } from 'uuid';

@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.page.html',
  styleUrls: ['./uploads.page.scss'],
})
export class UploadsPage implements OnInit {
  _id: any;
  key: any;
  mobile: any;
  devices: any = [];
  files: any = [];
  @ViewChild("fileInput", { read: ElementRef }) fileInput: any;

  constructor(
    private http: HttpService,
    private utils: UtilsService,
    private nav: NavController,
    private platform: Platform,
    private loadingService: LoadingService,
    private alertsService: AlertsService
  ) {
    let hash = location.hash.split('/').slice(-2);
    this.key = hash[0];
    this._id = hash[1];
  }

  ngOnInit() { }

  ngAfterViewInit() {

  }

  askFile() {
    this.fileInput.nativeElement.click();
  }

  handleAction(action: string, ev?: any) {
    let map = {
      'select': ev => {
        this.files = [];
        let files: File[] = Array.from(ev.target?.files);
        for (let file of files) {
          if (this.utils.validFile(file)) {
            ev.target.value = '';
            this.files.push(file);
            this.uploadFiles();
          } else {
            this.alertsService.notify({ type: "warning", subtitle: "Falha na seleção de arquivo." })
          }
        }
      }
    }
    return map[action](ev);
  }

  async uploadFiles() {
    this.loadingService.show();
    let url = [environment.API.storage, 'uploads', 'index.php'].join('/');
    let upload = await this.http.post(url, { _id: this._id, folder: this.key }, { arquivo: this.files[0] })
    this.loadingService.hide();

    if (!upload?.url)
      return this.handleError("Falha ao enviar o arquivo");

    this.alertsService.notify({
      type: "success",
      subtitle: "Arquivo enviado com sucesso"
    });

    this.nav.back();
  }

  handleError(error) {
    this.alertsService.notify({
      type: "error",
      subtitle: error?.message || error
    });
  }
}
