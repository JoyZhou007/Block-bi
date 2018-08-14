import {Directive,Renderer, ElementRef,HostListener,HostBinding} from '@angular/core';

@Directive({
  selector: '[BtnCheckbox]'
})
export class BtnCheckBoxDirective {
  public state: boolean = false;
  @HostListener('click', ['$event'])
  onClick(event: any) {
    this.toggle();
  }
  @HostBinding('class.selected')
  get selected():boolean { return !this.state;}

  constructor(public renderer: Renderer,public elementRef: ElementRef) {
  }

  toggle() {
    this.state = !this.state;
  }
}
