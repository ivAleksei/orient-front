import { Directive, ElementRef } from "@angular/core";
import { LocalStorageService } from "../services/local-storage.service";

@Directive({
  selector: "[has-permission]"
})
export class HasPermissionDirective {
  constructor(
    private storage: LocalStorageService,
    private el: ElementRef
  ) { }

  elem: any = this.el.nativeElement;

  ngOnInit() {
    let key = $(this.elem).attr('has-permission');
    let _permissions = JSON.parse(sessionStorage.getItem("_permissions") || '{}');

    if (!_permissions[key])
      $(this.elem).remove();
  }

}
