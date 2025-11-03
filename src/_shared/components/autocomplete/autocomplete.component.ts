import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { UtilsService } from 'src/_shared/services/utils.service';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
})
export class AutocompleteComponent implements OnInit {

  @Input() _id: string | any;
  @Input() multiple: any;
  @Input() ionlabel: string | any;
  @Input() label: string | any;
  @Input() placeholder: string | any;

  @Input() data: any = [];

  @Input() disabled: any;
  @Input() text: any;
  @Input() input: any;
  @Input() refresh: any;
  @Input() clear: any;
  textSub: Subscription | undefined;
  inputSub: Subscription | undefined;
  refreshSub: Subscription | undefined;
  clearSub: Subscription | undefined;

  @Output() public chooseEvent: EventEmitter<any> = new EventEmitter();
  @Output() public keyEvent: EventEmitter<any> = new EventEmitter();
  @Output() public newEvent: EventEmitter<any> = new EventEmitter();

  value: any;

  data_maped: any;
  arr: any = [];
  filter_data: any = [];

  constructor(
    private utils: UtilsService
  ) { }

  ngOnInit() {
    if (this.refresh)
      this.refreshSub = this.refresh.subscribe((ev) => this.setArr(ev));
    if (this.text)
      this.textSub = this.text.subscribe((ev) => {
        this.value = ev;
      });
    if (this.input)
      this.inputSub = this.input.subscribe((ev) => this.setValue(ev));
    if (this.clear)
      this.clearSub = this.clear.subscribe((ev) => this.clearInput());
  }

  setArr(data) {
    this.filter_data = (data || []);
  }

  clearInput() {
    // CLOSE LIST
    this.arr = [];
    this.filter_data = [];
    // SET VALUE
    this.value = null;
    // EMIT VALUE
    this.chooseEvent.emit(null);
  }

  setValue(_id?) {
    let find = (this.data || []).find(it => it[this._id] == _id);
    if (find) this.choose(find);
  }

  filterData(ev) {
    if (!this.data_maped) {
      this.data_maped = (this.data || []).map(it => {
        it.maped = this.utils.removeAcento(it[this.label]?.toLocaleLowerCase());
        return it;
      });
    }

    if (ev.keyCode == 13) {
      if (this.filter_data?.length) {
        return this.choose(this.filter_data[0]);
      } else {
        this.newEvent.emit(this.value);
      }
    }

    if (!this.value) {
      this.filter_data = [];
      this.chooseEvent.emit(null);
      this.keyEvent.emit(this.value);
      return;
    }

    this.keyEvent.emit(this.value);

    let map_value = this.utils.removeAcento(this.value);

    this.filter_data = (this.data || []).filter(it => {
      return (it.maped || "").includes(map_value.toLocaleLowerCase())
    });
  }

  choose(it) {
    // CLOSE LIST
    this.filter_data = [];
    // SET VALUE
    if (this.multiple) {
      this.value = '';
      this.arr.push(it);
      // EMIT VALUE
      this.chooseEvent.emit(this.arr);
    } else {
      this.value = it[this.label];
      // EMIT VALUE
      this.chooseEvent.emit(it);
    }
  }

  rmArr(it) {
    this.arr = (this.arr || []).filter(_a => _a._id != it._id);
    this.chooseEvent.emit(this.arr);
  }
}
