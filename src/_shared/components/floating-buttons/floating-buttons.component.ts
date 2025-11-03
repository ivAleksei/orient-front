import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-floating-buttons',
  templateUrl: './floating-buttons.component.html',
  styleUrls: ['./floating-buttons.component.scss'],
})
export class FloatingButtonsComponent implements OnInit {

  @Input() options: any = {
    type: "column"
  };
  @Input() buttons: any;
  @Input() toggle: any;
  @Input() open: any = false;
  @Output() public clickEv: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.open) {
      this.open = changes.open.currentValue;
      this.toggleBtns();
    }

    if (changes.buttons) {
      this.buttons = changes.buttons.currentValue;
      this.toggleBtns();
    }


  }

  ngOnInit() { }

  toggleOpen() {
    this.open = !this.open;
    this.toggleBtns();
  }

  toggleBtns() {
    let i_row = 1;
    let i_col = 1;
    for (let b of this.buttons) {

      if (b.flow == 'down') {
        if (innerWidth > 768) {
          b.bottom = this.open ? `-${i_col * 56}px` : '0px';
          b.bottom = this.open ? `-${i_col * 56}px` : '0px';
          i_col++;
        } else {
          b.flow = 'up';
        }
      }

      if (b.flow == 'up') {
        b.bottom = this.open ? `${i_col * 56}px` : '0px';
        b.bottom = this.open ? `${i_col * 56}px` : '0px';
        i_col++;
      }


      if (b.flow == 'right') {
        b.right = this.open ? `${i_row * 56}px` : '0px';
        b.right = this.open ? `${i_row * 56}px` : '0px';
        i_row++;
      }
      if (b.flow == 'left') {
        b.right = this.open ? `${i_row * 56}px` : '0px';
        b.right = this.open ? `${i_row * 56}px` : '0px';
        i_row++;
      }

    }
  }

  clickEvent(btn) {
    if (!btn.disabled)
      this.clickEv.next(btn)
  }
}
