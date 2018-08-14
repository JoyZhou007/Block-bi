import {
  Directive, ElementRef, OnInit, AfterViewInit,Renderer
} from '@angular/core';
import * as autoFadeConfig from '../../config/autoFade.config';
@Directive({
  selector: '[help]'
})
export class HelpDirective implements OnInit,AfterViewInit {
  constructor(
    private elementRef: ElementRef,
    private renderer:Renderer
  ) {}
  ngOnInit() {}



  ngAfterViewInit() {
    this.elementRef.nativeElement.addEventListener('click', (event: any) => {
      let body: any = document.getElementsByTagName('body')[0];
      this.renderer.setElementClass(body, 'body-help', true);
    });
  }


}