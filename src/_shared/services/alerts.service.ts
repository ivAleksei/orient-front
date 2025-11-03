import { Injectable } from "@angular/core";
import { AlertController } from '@ionic/angular';
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: "root",
})
export class AlertsService {


  constructor(
    public toastrService: ToastrService,
    public alertController: AlertController,
  ) { }

  async askConfirmation(title?: string, text?: string) {
    let options = {
      header: title || "",
      message: text || "",
      buttons: [
        { id: "false", label: 'Cancelar' },
        { id: "true", label: 'Confirmar' },
      ],
    };
    return this.ask(options);
  }

  async showAlert(message: string, header?: string) {
    let options = {
      header: header,
      message: message,
      buttons: ["OK"],
      backdropDismiss: false,
    };

    const alert = await this.alertController.create(options);

    await alert.present();
  }

  async ask(options: any) {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        backdropDismiss: false,
        header: options.header,
        cssClass: options.class || "",
        subHeader: options.subHeader,
        message: options.message,
        buttons: (options.buttons || []).map((b: any) => {
          if (b.id) {
            return {
              text: b.label,
              handler: () => {
                resolve(b.id);
              },
            };
          }
          return {
            text: b,
            handler: () => {
              resolve(b);
            },
          };
        }),
      });

      return alert.present();
    });
  }

  /**
   * cancel - Retorna evento de cancelamento
   */
  confirmDel() {
    return this.askConfirmation(
      'Você tem certeza em remover este conteúdo?',
      'Você não poderá recuperar estes dados posteriormente.'
    ).then(confirm => confirm == 'true');
  }

  notify(args: any) {
    let options = {
      timeOut: 3000,
      showProgressBar: true,
      pauseOnHover: true,
      clickToClose: true,
    };

    let current_opt = Object.assign({}, options, args.custom_options || {});
    if (args.type && this.toastrService[args.type]) {
      this.toastrService[args.type](args.subtitle, args.title, current_opt);
    } else {
      this.showAlert(args.subtitle, args.title);
    }
  }
}
