
import {Component, Input, Inject, OnInit} from "@angular/core";
import {Router} from "@angular/router";
@Component({
  selector: 'company-register-success-dialog',
  templateUrl: '../template/company-register-success-dialog.component.html',
})
export class CompanyRegisterSuccessDialog implements OnInit {
  private ele: any;

  constructor(
    public router: Router
  ) {
  }

  ngOnInit() {
  }

  @Input('setOption') public set setOption(data: any) {
    if(data){

    }
  }

}
