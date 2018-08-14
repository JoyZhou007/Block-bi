/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/2/7.
 */
import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output, QueryList,
  Renderer,
  SimpleChanges,
  Inject,
  ViewChild, ViewChildren
} from "@angular/core";
import { DropdownSettings } from "../dropdown-setting";

@Component({
  selector: 'dropdown-input',
  templateUrl: './../template/dropdown-input.component.html'
})
export class DropdownInputComponent implements AfterViewChecked, OnChanges, AfterViewInit {
  private init: boolean = false;

  public searchWarpWidth: number = 0;
  public searchValue: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    // let log: string[] = [];
    // for (let propName in changes) {
    //   let changedProp = changes[propName];
    //   let to = JSON.stringify(changedProp.currentValue);
    //   if (changedProp.isFirstChange()) {
    //     log.push(`Initial value of ${propName} set to ${to}`);
    //   } else {
    //     let from = JSON.stringify(changedProp.previousValue);
    //     log.push(`${propName} changed from ${from} to ${to}`);
    //   }
    // }
  }

  private _settings: DropdownSettings;
  private _selectedOptions: Array<any>;
  public searchInputWidth:string = '100%';
  @Output('outSearchEvent') outSearchEvent = new EventEmitter<any>();
  @Output('outRemoveElementEvent') outRemoveElementEvent = new EventEmitter<any>();
  @ViewChildren('selectedElementDiv') selectedElementDiv: QueryList<ElementRef>;
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('searchWarp') searchWarp: ElementRef;
  @ViewChild('textWidth') textWidth: ElementRef;

  @Input('settings') set settings(data: DropdownSettings) {
    this._settings = data;
  };

  get settings() {
    return this._settings;

  }

  @Input('selectedOptions') set selectedOptions(data: Array<any>) {
    if (data) {
      this._selectedOptions = data;
      this.init = false;
    }
  };

  get selectedOptions() {
    return this._selectedOptions;
  }

  constructor(private renderer: Renderer,
              @Inject('user-data.service') public userDataService: any,
              private el: ElementRef,) {}

  ngAfterViewChecked(): void {
    if (this.searchWarp && this.searchInput && this.selectedElementDiv && this.textWidth && !this.init) {
      this.calcSelectListWidth();
      this.init = true;
    }
  }

  ngAfterViewInit() {
    if (this.searchInput && this.searchWarp) {
      this.searchInput.nativeElement.addEventListener('focus', () => {
        this.calcSelectListWidth();
      });
      this.searchInput.nativeElement.addEventListener('input', () => {
        // 打开下拉菜单

        this.calcSelectListWidth();
      });
      this.searchWarp.nativeElement.addEventListener('click', () => {
        if (this.searchInput) {
          this.searchInput.nativeElement.focus();
        }
      });
    }
  }

  calcSelectListWidth() {
    try {
      let finalWidth: any;
      // 无选项
      if (this.selectedOptions && this.selectedOptions.length === 0 || this.selectedElementDiv.length == 0) {
        finalWidth = '100%';
      // 有选项切DIV初始完毕后
      } else if (this.selectedElementDiv) {
        let totalWidth =  this.searchWarp.nativeElement.offsetWidth;
        let min = 50;
        let last = this.selectedElementDiv.last.nativeElement;
        // 实际可用宽度 减去最后一个元素到父级元素的width和到父级左侧的边距
        finalWidth = totalWidth - last.offsetWidth - last.offsetLeft;
        // 最小可见文本框定位50px
        if (finalWidth < min) {
          finalWidth = min;
        }
        finalWidth = finalWidth + 'px';
      }
      this.renderer.setElementStyle(this.searchInput.nativeElement, 'width', finalWidth);
    } catch (e) {
      return
    }
  }

  searchAction(event: KeyboardEvent, searchText: any) {
    event.stopPropagation();
    this.outSearchEvent.emit([searchText]);
  }

  removeSelectedItem(event: any, option: any) {
    event.stopPropagation();
    let couldDelete = true;
    if (typeof this.settings.removeEvent === 'function') {
      couldDelete = this.settings.removeEvent(option);
    }
    if (!this.settings.readonly && couldDelete) {
      let element = event.target;
      let a = element.classList;
      if (a.length) {
        for (let i = 0; i < a.length; i++) {
          // 点在删除按钮上
          if (a[i] === this.settings.delBtnClass || a[i] === this.settings.delBtnClass1) {
            for (let i in this.selectedOptions) {
              if (this.selectedOptions.hasOwnProperty(i) && this.selectedOptions[i].id === option.id) {
                this.selectedOptions.splice(parseInt(i), 1);
                this.outRemoveElementEvent.emit([option, 'delete']);
                if (this.selectedOptions && this.selectedOptions.length === 0) {
                  this.renderer.setElementStyle(this.searchInput.nativeElement, 'width', this.searchWarpWidth + 'px');
                }
              }
            }
            break;
          }
        }
      }
    }
  }
}