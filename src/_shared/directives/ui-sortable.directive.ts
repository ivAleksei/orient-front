import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';

declare var $: any;

@Directive({
  selector: '[UiSortable]'
})
export class UiSortableDirective {
  @Input() origin: any;
  @Input() connect: any;
  @Input() reload: any;
  @Input() prop: any;
  @Output() public changeList: EventEmitter<any> = new EventEmitter();
  elem: any;
  reloadSub: any;

  constructor(
    private el: ElementRef
  ) {
    this.elem = this.el.nativeElement;
    if (this.reload)
      this.reloadSub = this.reload.subscribe(async (event) => {
        this.refreshList();
      });
  }

  ngOnDestroy() {
    if (this.reloadSub && !this.reloadSub.closed)
      this.reloadSub.unsubscribe();
  }

  ngAfterViewInit() {
    $([this.origin, this.elem.id].filter(s => s).map(s => `#${s}`).join(',')).sortable({
      connectWith: this.connect || null,
      update: (ev, ui) => {
        var items = {};

        $(`#${this.elem.id} li`).each((i, el, c) => {
          items[$(el).attr('id')] = 1;
        });
        $(`#${this.elem.id} tr`).each((i, el, c) => {
          items[$(el).attr('id')] = 1;
        });
        if (this.prop)
          $(`#${this.elem.id} ${this.prop}`).each((i, el, c) => {
            items[$(el).attr('id')] = 1;
          });

        this.changeList.next({
          id: this.elem.id,
          list: Object.keys(items || {}).filter(s => s != 'undefined')
        });
      }
    }).disableSelection();
  }

  refreshList() {
    $(`#${this.elem.id}`).refresh();
  }

}
