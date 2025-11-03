import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-filter-by',
  templateUrl: './filter-by.component.html',
  styleUrls: ['./filter-by.component.scss'],
})
export class FilterByComponent implements OnInit {
  @ViewChild("FilterForm") FilterForm: any;

  @Input() open: boolean = false;
  @Input() filters: any = []
  @Output() public filterEvent: EventEmitter<any> = new EventEmitter();
  @Output() public changeEvent: EventEmitter<any> = new EventEmitter();

  openTabs: any = null;

  constructor() { }

  ngOnInit() {
    if (this.open) this.openTabs = 'filter';
    if (window.innerWidth < 768)
      this.filters = (this.filters || []).map(f => {
        f.size = 12;
        return f;
      });
  }

  applyFilter() {
    let obj = Object.assign({}, this.FilterForm.value);
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        const element = obj[k];
        if (!element) delete obj[k];
      }
    }

    this.filterEvent.next(obj);
  }

  clearFilter() {
    this.FilterForm.form.reset();
    this.filterEvent.next({});
  }

  changeEv() {
    let obj = Object.assign({}, this.FilterForm.value);
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        const element = obj[k];
        if (!element) delete obj[k];
      }
    }

    this.changeEvent.next(obj);
  }

  keyEvent(ev) {
    if (ev?.keyCode == 13)
      this.applyFilter();
  }
}
