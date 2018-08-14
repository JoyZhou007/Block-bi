/**
 * Created by joyz on 2017/7/19.
 */

import {Component, EventEmitter, Input, Output, ViewEncapsulation} from "@angular/core";


@Component({
  selector: 'user-footer',
  templateUrl: '../template/user-footer.component.html',
  encapsulation: ViewEncapsulation.None
})

export class UserFooterComponent {
  //显示contact-us
  @Input() public isShowContactUs: boolean = false;
  private product: boolean = false;
  private joinUsColor: boolean = false;
  @Input() set isProduct(data){
    this.product = true;
  }
  @Input() set joinUs(data){
    this.joinUsColor = !!data;
  }
  @Output() OutShowContact = new EventEmitter<MouseEvent>();

  constructor() {
  }

  public clickShowContactUs(event:MouseEvent): void {
    event.stopPropagation();
    this.OutShowContact.emit(event);
  }
}