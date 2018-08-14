import {Component, EventEmitter, OnInit, Output, ViewEncapsulation, Inject} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'contacts-company-ability',
  templateUrl: '../template/contacts-company-ability.component.html',
  styleUrls:[
    '../../../assets/css/contacts/contact.css',
    '../../../assets/css/account/account.css'
  ],
  encapsulation: ViewEncapsulation.None
})

export class ContactsCompanyAbilityComponent implements OnInit{

  public uid: any;
  @Output('hasInit') outHasInit: any = new EventEmitter<any>();
  constructor(
    public activatedRoute: ActivatedRoute,
    @Inject('app.config') public config: any
  ) {}

  ngOnInit() {
    //获取URL参数
    this.activatedRoute.params.subscribe((params: any) => {
      if (this.uid != params.uid && params.type === 'intro') {
        this.uid = params.uid;
      }
    });
  }

}
