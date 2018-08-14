/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/2/7.
 */
import {
  Component, OnInit, Input, ViewChild, AfterViewInit, AfterViewChecked, ViewEncapsulation,
  ElementRef, Output, EventEmitter, OnChanges, SimpleChanges, Inject, Renderer
} from '@angular/core';
import {DropdownSettings} from '../dropdown-setting';
import {DropdownInputComponent} from "./dropdown-input.component";
import {DropdownSelectComponent} from "./dropdown-select.component";
import {DropdownOptionModel} from "../dropdown-element";


@Component({
  selector: 'dropdown-search',
  templateUrl: './../template/dropdown.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DropdownComponent implements AfterViewChecked, OnChanges, OnInit {
  ngOnInit(): void {
  }

  changeLog: string[] = [];

  constructor(private renderer: Renderer,
              @Inject('type.service') public typeService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('toggle-select.service') public toggleSelectService: any) {
  }

  protected hasInit: boolean = false;
  // 下拉菜单设置选项
  protected _dropdownSettings: DropdownSettings = new DropdownSettings();
  public _currentDropdownSettings: DropdownSettings = new DropdownSettings();
  // 可选下拉
  protected _dropdownOptions: Array<any> = [];
  // 已选中下拉
  protected _selectedOptions: Array<any> = [];
  // 原型
  protected _optionModelArr: Array<any>;
  public getCalcHeight: number = 0;

  @Input('optionModelArr') set optionModelArr(data: Array<any>) {
    this._optionModelArr = data;
  };

  public optionInit: boolean = false;
  public selectInit: boolean = false;
  public reset: boolean = false;
  public resetDropdown: boolean = false;
  public resetOption: boolean = false;
  public resetSettings: boolean = false;
  public selectWarp: any;
  public currClass: string = 'se-input-current';

  /**
   * setParams
   * @param param
   */
  @Input() set setParams(param: any) {
    //this.reset = param;
  }

  @Input() set calcWindowHeight(height: number) {
    if (height) {
      this.getCalcHeight = height;
    }
  }


  get optionModelArr() {
    return this._optionModelArr;
  }

  @Output('optionModelArrChange') optionModelArrChange = new EventEmitter<any>();

  @ViewChild('toggleInput') toggleInput: ElementRef;
  @ViewChild('dropdownInput') dropdownInputComponent: DropdownInputComponent;
  @ViewChild('dropdownSelect') dropdownSelectComponent: DropdownSelectComponent;
  @ViewChild('toggleSelect') toggleSelect: ElementRef;

  @Input('dropdownSettings') set dropdownSettings(data: DropdownSettings) {
    if (data) {
      this._currentDropdownSettings = data;
    }
    if (data && !this.resetDropdown) {
      for (let key in data) {
        if (this.dropdownSettings.hasOwnProperty(key) && data.hasOwnProperty(key)) {
          this.dropdownSettings[key] = data[key];
        }
      }
      this.resetDropdown = false;
    }
  };

  get dropdownSettings() {
    return this._dropdownSettings;
  }

  @Input('dropdownOptions') set dropdownOptions(data: Array<any>) {
    this.optionInit = true;
    this._dropdownOptions = data;
  };

  get dropdownOptions() {
    return this._dropdownOptions;
  }

  @Input('selectedOptions') set selectedOptions(data: Array<any>) {
    if (data.length && this._dropdownOptions.length) {
      this._selectedOptions = data;
      for (let j in this._selectedOptions) {
        let selectedEle = this.typeService.clone(this._selectedOptions[j]);
        let flag: boolean = false;
        for (let i in this._dropdownOptions) {
          let ele = this._dropdownOptions[i];
          if (ele.id == selectedEle.id) {
            flag = true;
            this._dropdownOptions[i].isCurrent = true;
            selectedEle = ele;
            // //对于选中值 支持除了id其他先默认为空
            // if (ele.hasOwnProperty('group') && ele.group && selectedEle.hasOwnProperty('group') && !selectedEle.group) {
            //   selectedEle.group = ele.group;
            // }
            // if (ele.hasOwnProperty('key') && ele.key && selectedEle.hasOwnProperty('key') && !selectedEle.key) {
            //   selectedEle.key = ele.key;
            // }
            // if (ele.hasOwnProperty('label') && ele.label && selectedEle.hasOwnProperty('label') && !selectedEle.label) {
            //   selectedEle.label = ele.label;
            // }
            // if (ele.hasOwnProperty('imageLabel') && ele.imageLabel && selectedEle.hasOwnProperty('imageLabel') && !selectedEle.imageLabel) {
            //   selectedEle.imageLabel = ele.imageLabel;
            // }
            // if (ele.hasOwnProperty('desc') && ele.desc && selectedEle.hasOwnProperty('desc') && !selectedEle.desc) {
            //   selectedEle.desc = ele.desc;
            // }
          }
        }

        if (!flag && (selectedEle.label == '' && selectedEle.key == '')) {
          selectedEle.label = this.translateService.manualTranslate('Not Found');
        }
        this._selectedOptions[j] = this.typeService.clone(selectedEle);
      }
      if (this.reset || this.optionInit) {
        this.dropdownInputComponent.selectedOptions = this._selectedOptions;
      }
      if (this.reset || this.optionInit) {
        this.dropdownSelectComponent.selectedOptions = this._selectedOptions;
      }
      if (this.reset) {
        this.reset = false;
      }
    } else {
      this._selectedOptions
        = this.dropdownInputComponent.selectedOptions
        = this.dropdownSelectComponent.selectedOptions = [];
    }

  }

  get selectedOptions() {
    return this._selectedOptions;
  }

  ngOnChanges(changes: SimpleChanges): void {
    let log: string[] = [];

    for (let propName in changes) {
      let changedProp = changes[propName];
      let to = JSON.stringify(changedProp.currentValue);
      if (propName === 'selectedOptions') {
        this.reset = true;
      }
      if (propName === 'dropdownOptions') {
        this.resetDropdown = true;
        this.dropdownSelectComponent.openStatus = false;
      }
      if (changedProp.isFirstChange()) {
        log.push(`Initial value of ${propName} set to ${to}`);
      } else {
        let from = JSON.stringify(changedProp.previousValue);
        log.push(`${propName} changed from ${from} to ${to}`);
        if (propName === 'selectedOptions') {

        }
        if (propName === 'dropdownOptions') {
          this.resetOption = true;
          this.toggleOptionsChange(changedProp.currentValue);
        }
        if (propName === 'dropdownSettings') {

          this.resetSettings = true;
          this.toggleSettingsChange(changedProp.currentValue);
        }
      }
    }
    //.log('dropdown component .changeLog', log);
  }

  ngAfterViewChecked(): void {
    if (!this.hasInit && typeof this.toggleInput !== 'undefined') {
      this.hasInit = true;
    }
  }

  /**
   * 输入框触发下拉选项显示
   * @param event
   */
  toggleDropdownEvent(event: any) {
    // event.stopPropagation();
    //对于输入框, 在第一次点击的时候打开下拉菜单
    if (event.target.tagName !== 'INPUT') {
      this.toggleDropdownSelectStatus();
    } else {
      if (!this.dropdownSelectComponent.openStatus) {
        this.toggleDropdownSelectStatus();
      }
    }
  }

  updateOptionModelArr(data?: any) {
    let changedOptions = [];
    let changeStatus = '';
    if (data) {
      changedOptions = data[0]; //
      changeStatus = data[1]; // add , delete
    }
    this.optionModelArrChange.emit([this.selectedOptions, changedOptions, changeStatus]);
  }

  /**
   * 将select之前被选中值内容重新赋给input和父模块
   */
  toggleSelectedOptionsEvent(data?: any) {
    this.dropdownInputComponent.selectedOptions = this.selectedOptions = this.dropdownSelectComponent.selectedOptions;
    this.updateOptionModelArr(data);
  }


  /**
   * 将input之前被删除内容重新赋给input和父模块
   */
  removeSelectedOptionsEvent(data?: any) {
    this.dropdownSelectComponent.selectedOptions = this.selectedOptions = this.dropdownInputComponent.selectedOptions;
    let ele = data[0];
    for (let i in this.dropdownSelectComponent.dropdownOptions) {
      if (this.dropdownSelectComponent.dropdownOptions.hasOwnProperty(i)
        && this.dropdownSelectComponent.dropdownOptions[i].key == ele.key) {
        this.dropdownSelectComponent.dropdownOptions[i].isCurrent = false;
      }
    }
    this.dropdownOptions = this.dropdownSelectComponent.dropdownOptions;
    this.updateOptionModelArr(data);
  }

  /**
   * 下拉菜单显示样式控制
   */
  toggleDropdownSelectStatus() {
    if (!this.dropdownSelectComponent.openStatus) {
      //TODO: JS控制动态高度实现渐变效果;
      this.dropdownSelectComponent.autoHeight = 'auto';
    }
    this.dropdownSelectComponent.openStatus = !this.dropdownSelectComponent.openStatus;
    this.renderer.setElementClass(this.toggleSelect.nativeElement, 'hide', false);
  }

  /**
   * input模块触发select中内容搜索
   * todo: 支持远程搜索
   * @param data
   */
  triggerSearchAction(data: any) {
    if (typeof data !== 'undefined') {
      let searchText = data[0];
      if (searchText !== '') {
        this.toggleDropdownSelectStatus();
        this.dropdownSelectComponent.filterDropdown(searchText);
      } else {
        this.dropdownSelectComponent.resetFilterDropdown();
      }
    }
  }

  toggleSettingsChange(settings: any) {
    if (this.resetSettings && settings) {
      //let settings = new DropdownSettings(data);
      this.dropdownSelectComponent.settings = settings;
      this.dropdownInputComponent.settings = settings;
      this.resetSettings = false;
    }
  }

  toggleOptionsChange(data: any) {
    if (this.resetOption && data) {
      this._dropdownOptions = data;
      this.dropdownSelectComponent.dropdownOptions = data;
      this.resetOption = false;
    }
  }

  @Output() doCloseDropDown = new EventEmitter<any>();

  closeOptionDropdown(data?: any) {
    this.renderer.setElementClass(this.selectWarp.toggleSelectElement, 'hide', true);
    this.renderer.setElementClass(this.selectWarp.toggleInput, 'se-input-current', false);
    this.selectWarp = {};
    this.toggleSelectService.emptyElement();
    // this.doCloseDropDown.emit();
  }

  /**
   * 返回的元素对象
   * @param element
   */
  doCallBackData(element: any) {
    this.selectWarp = element;
  }

}