import {Directive, Renderer, Output, EventEmitter, AfterViewInit, ElementRef, Input} from '@angular/core';

@Directive({
  selector: '[saveDataGroup]'
})

export class SaveDataDirective implements AfterViewInit {

  private saveDataElement: any;
  private className: string = 'but-loading';
  @Output() public outSaveData = new EventEmitter<any>();
  private isStart: boolean = false;
  @Input() set btnStart(data: any){
    if(data && data.isStart){
      this.isStart = true;
    }
  }
  constructor(
    private renderer: Renderer,
    private elementRef: ElementRef
  ) {}

  ngAfterViewInit() {
    this.saveDataElement = this.elementRef.nativeElement;
    this.setSaveClassName();
  }

  /**
   * 设置className
   */
  setSaveClassName() {
      this.saveDataElement.addEventListener('click', () => {
          let className: string = this.saveDataElement.className;
          if(!/but-loading/.test(className)) {
            this.renderer.setElementClass(this.saveDataElement, this.className, true);
            setTimeout(() => {
              this.renderer.setElementClass(this.saveDataElement, this.className, false);
              this.outSaveData.emit();
            }, 600);
          }
      })
  }

}