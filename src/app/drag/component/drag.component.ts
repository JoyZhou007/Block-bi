import {
  Component, OnInit, Input, ViewChild, AfterViewInit, ViewEncapsulation,
  ElementRef, Output, EventEmitter, OnChanges, SimpleChanges, Inject, Renderer, ViewChildren, QueryList
} from '@angular/core';

import * as FolderConstant from '../../shared/config/folder.config';

@Component({
  selector: 'drag',
  templateUrl: './../template/drag.component.html',
  encapsulation: ViewEncapsulation.None

})
export class DragComponent implements AfterViewInit, OnChanges, OnInit {


  @Output() public doSelectPermission = new EventEmitter<any>();

  @Output() public doDragOption = new EventEmitter<any>();

  @Output() public doDeleteOption = new EventEmitter<any>();

  public currentPermissionType: string = 'Read';

  public permissionList: Array<any>;

  public permissionOptionList: any;

  public currentPermissionOption: Array<any>;

  public isStartMove: boolean = false;

  public dragOption: any;

  public choosePermission: number;

  public folderConstant: any;

  public isRead: boolean = false;

  public isWrite: boolean = false;

  public isControl: boolean = false;

  public permission: any = {
    isAbleControl: true,
    isAbleWrite: true,
  };


  @ViewChild('dragUl') dragUl: ElementRef;
  @ViewChildren('dragLi') dragLi: QueryList<ElementRef>;

  ngOnInit(): void {
    this.permissionList = this.getPermissionList();
  }


  constructor(public el: ElementRef,
              @Inject('page.element') public element: any,
              public renderer: Renderer) {
    this.folderConstant = FolderConstant;
  }

  ngAfterViewInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  @Input() set selectOption(param: any) {
    this.permissionOptionList = param;
    this.currentPermissionOption = this.permissionOptionList[this.currentPermissionType];
  }

  @Input() set setPermission(param: any) {
    this.permission = param;
  }

  /**
   * 点击权限tab选项选择当前权限
   */
  selectThePermission(type: string) {
    this.currentPermissionType = type;
    this.currentPermissionOption = this.permissionOptionList[this.currentPermissionType];
    this.doSelectPermission.emit(this.currentPermissionType);
  }


  /**
   * 获得权限列表
   */
  getPermissionList(): Array<{key: any}> {
    return [
      {
        key: FolderConstant.PERMISSION_FOLDER_READ
      },
      {
        key: FolderConstant.PERMISSION_FOLDER_WRITE
      },
      {
        key: FolderConstant.PERMISSION_FOLDER_CONTROL
      },
    ];
  }

  dragStartEvent(event: any, ele: any, index: number) {
    event.stopPropagation();
    this.dragOption = ele;
    this.isStartMove = true;
    if (this.currentPermissionType === FolderConstant.PERMISSION_FOLDER_READ) {
      this.isRead = true;
    } else if (this.currentPermissionType === FolderConstant.PERMISSION_FOLDER_WRITE) {
      this.isWrite = true;
    } else if (this.currentPermissionType === FolderConstant.PERMISSION_FOLDER_CONTROL) {
      this.isControl = true;
    }
  }


  dragEndEvent(event: any) {
    event.stopPropagation();
    this.isStartMove = false;
    this.isWrite = false;
    this.isControl = false;
    this.isRead = false;
  }


  dragEnterEvent(event: any, type: string) {
    event.stopPropagation();
    if (type === FolderConstant.PERMISSION_FOLDER_READ) {
      this.isRead = true;
    } else if (type === FolderConstant.PERMISSION_FOLDER_WRITE) {
      this.isWrite = true;
    } else if (type === FolderConstant.PERMISSION_FOLDER_CONTROL) {
      this.isControl = true;
    }
  }


  allowDrop(event: any) {
    event.preventDefault();
  }


  dragLeaveEvent(event: any, type: string) {
    event.stopPropagation();
    if (type === FolderConstant.PERMISSION_FOLDER_READ) {
      this.isRead = false;
    } else if (type === FolderConstant.PERMISSION_FOLDER_WRITE) {
      this.isWrite = false;
    } else if (type === FolderConstant.PERMISSION_FOLDER_CONTROL) {
      this.isControl = false;
    }
  }


  dropEvent(event: any, type: any) {
    event.preventDefault();
    this.isStartMove = false;
    this.choosePermission = type;
    let dragData: any = {
      key: this.choosePermission,
      dragOption: this.dragOption
    };
    this.doDragOption.emit(dragData);
    this.isWrite = false;
    this.isControl = false;
    this.isRead = false;
  }

  deleteTheSelect(event: any, member) {
    event.stopPropagation();
    let deleteData: any = {
      key: this.currentPermissionType,
      deleteOption: member
    };
    this.doDeleteOption.emit(deleteData);
  }


}