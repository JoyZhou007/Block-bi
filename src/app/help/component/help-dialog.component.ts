import { Component,  Input, ViewEncapsulation, ElementRef,} from "@angular/core";

@Component({
  selector: 'help-dialog',
  templateUrl: '../template/help-dialog.component.html',
  encapsulation: ViewEncapsulation.None,
})


export class HelpDialogComponent {

  private helpModel: string;

  constructor(public _el: ElementRef) {

  }

  @Input('setOption')
  public set setOption(data: any) {
    if (data) {
      this.helpModel = data.model;
    }
  }


}