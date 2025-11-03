import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { v1 as uuid } from 'uuid';
declare var $: any;

@Component({
  selector: "app-summernote",
  templateUrl: "./summernote.component.html",
  styleUrls: ["./summernote.component.scss"],
  providers: []
})
export class SummernoteComponent implements OnInit {

  @Input() valueInput: any;
  @Input() options: any;
  @Output() public changeEv: EventEmitter<any> = new EventEmitter();

  tmp_id: any;
  target: any;
  interval: any;
  valueSub: Subscription;

  default_options: any = {
    tabsize: 2,
    height: 400,
    focus: true,
    lang: 'pt-BR',
    spellCheck: true,
    disableGrammar: false,
    toolbar: [
      ['style', ['style']],
      ['font', ['bold', 'italic', 'underline', 'clear']],
      ['fontstyle', ['strikethrough', 'superscript', 'subscript']],
      ['fontname', ['fontname', 'fontsize']],
      ['color', ['color', 'backcolor']],
      ['paragraph', ['ul', 'ol', 'paragraph']],
      ['table', ['table']],
      ['insert', ['link', 'hr']],
      ['view', ['help']]
    ],
    callbacks: {
      onChange: (innerHTML, $editable) => {
        this.changeEv.next(innerHTML);
      }
    }
  }

  constructor() {

  }

  ngOnInit() {
    this.tmp_id = uuid().split('-').slice(-1);

    this.valueSub = this.valueInput?.subscribe(ev => {
      this.target.summernote('code', ev);
    })

    this.interval = setInterval(() => {
      this.target = $('#' + this.tmp_id);
      this.start();
      if (this.target) clearInterval(this.interval);
    }, 400);
  }

  ngOnDestroy() {
    if (!this.valueSub?.closed)
      this.valueSub?.unsubscribe();

    this.target?.summernote('destroy');
  }

  start() {
    this.target?.summernote(Object.assign({}, this.default_options, this.options || {}));
  }



}
