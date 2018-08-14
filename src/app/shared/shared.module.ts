import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule}    from '@angular/forms';

import { BrowserModule }  from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
// import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';


import {SelectDateDirective, UploadDirective,LinkedOperationDirective,
  ToggleSelectDirective,ToggleGroupDirective,ContentHeightDirective,
  BtnCheckBoxDirective,AutoFadeDirective, AutomaticHeightDirective,
  AutoWidthDirective, SetElementDirective, MoveElementDirective, ElementRollingDirective,InputBlurDirective,
  EmailValidator, LoadMoreDirective, SaveDataDirective,HelpDirective
}
  from './directive/index.directive';

import {SwitchButtonComponent, CropperComponent, LoadingBarComponent, PermissionSettingComponent, SearchListComponent,
CurrentUserComponent, SelectFilterComponent} from './components/index.component';

import {StringFormatPipe, DataLengthPipe,
  NumberFormatPipe, DateFormatPipe, UrlFormatPipe} from './pipe/index.pipe';
import {LoadersCssModule} from 'angular2-loaders-css';

//程序全局配置
import {AppConfig} from './config/app.config';

import{
  ApiService, StoreService, D3Service, TypeService, DateService,
  StringService, PageStatusService,
  PageService, ElementService, DialogService, NoticeDialogService,
  AnimationService, FileService, UserDataService, CompanyDataService, NotificationDataService,
  BehaviourDataService, NotificationService,ChatMessageDataService, FolderDataService,
  ImService, MissionDataService, ConstInterFaceService, NotificationOffLineMessageService,
  VerificationService, ToggleSelectService, BiTranslateService
} from './services/index.service';
import {WindowRef} from "../WindowRef";
import {SanitizeHtmlPipe} from "./pipe/data/sanitize-html.pipe";
import {TranslateModule} from "@ngx-translate/core";
import {StructureDataService} from "./services/model/data/structure/structure-data.service";
import {ProfileImageComponent} from "./components/user/profile-image.component";
import {TextConst} from "./config/text-const.config";
import {UserService} from "./services/user/user.service";
import { ProfileStateComponent } from './components/user/profile-state.component';
import { DragDropDirective } from "./directive/file/dragdrop-file.directive";

/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    LoadersCssModule,
    TranslateModule,
   // BrowserModule
  ],
  declarations: [
    SelectDateDirective,
    UploadDirective,
    CropperComponent,

    LinkedOperationDirective,
    ToggleGroupDirective,
    ToggleSelectDirective,
    BtnCheckBoxDirective,
    ContentHeightDirective,
    AutoFadeDirective,
    AutomaticHeightDirective,
    AutoWidthDirective,
    SetElementDirective,
    MoveElementDirective,
    EmailValidator,
    LoadMoreDirective,
    SaveDataDirective,
    HelpDirective,
    DragDropDirective,

    ElementRollingDirective,
    InputBlurDirective,
    SwitchButtonComponent,
    LoadingBarComponent,
    PermissionSettingComponent,
    SearchListComponent,
    CurrentUserComponent,
    ProfileImageComponent,
    SelectFilterComponent,
    ProfileStateComponent,

    StringFormatPipe,
    DataLengthPipe,
    NumberFormatPipe,
    DateFormatPipe,
    UrlFormatPipe,
    SanitizeHtmlPipe,
  ],
  exports: [
    CommonModule,
    RouterModule,
    LoadersCssModule,
    //BrowserModule,
    TranslateModule,

    SelectDateDirective,
    UploadDirective,
    CropperComponent,

    LinkedOperationDirective,
    ToggleGroupDirective,
    ToggleSelectDirective,
    BtnCheckBoxDirective,
    ContentHeightDirective,
    AutoFadeDirective,
    AutomaticHeightDirective,
    AutoWidthDirective,
    SetElementDirective,
    MoveElementDirective,
    EmailValidator,
    LoadMoreDirective,
    SaveDataDirective,
    HelpDirective,
    DragDropDirective,

    ElementRollingDirective,
    InputBlurDirective,
    SwitchButtonComponent,
    LoadingBarComponent,
    PermissionSettingComponent,
    SearchListComponent,
    CurrentUserComponent,
    ProfileImageComponent,
    SelectFilterComponent,
    ProfileStateComponent,

    StringFormatPipe,
    DataLengthPipe,
    NumberFormatPipe,
    DateFormatPipe,
    UrlFormatPipe,
    SanitizeHtmlPipe
  ],
  providers: [
    WindowRef
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        {provide: 'app.config', useValue: AppConfig},
        {provide: 'text.const', useValue: TextConst},
        {provide : 'string.service', useClass: StringService },
        {provide : 'date.service', useClass: DateService },
        {provide : 'store.service', useClass: StoreService },
        {provide : 'd3.service', useClass: D3Service },

        {provide : 'type.service', useClass: TypeService },
        {provide : 'api.service', useClass: ApiService },
        {provide : 'user.service', useClass: UserService},

        {provide : 'page-status.service',  useClass: PageStatusService },
        {provide : 'page.service', useClass: PageService },
        {provide : 'page.element', useClass: ElementService },
        {provide : 'dialog.service', useClass: DialogService },
        {provide : 'notice-dialog.service', useClass: NoticeDialogService },

        {provide : 'notification.service', useClass: NotificationService },
        {provide : 'notification-data.service', useClass: NotificationDataService },

        {provide : 'page-animation.service', useClass: AnimationService },
        {provide : 'file.service', useClass: FileService },

        {provide : 'user-data.service', useClass: UserDataService },
        {provide : 'company-data.service', useClass: CompanyDataService },
        {provide : 'structure-data.service', useClass: StructureDataService },
        {provide : 'user-behaviour.service', useClass: BehaviourDataService },
        {provide : 'mission-data.service', useClass: MissionDataService },
        {provide : 'im.service', useClass: ImService },
        {provide : 'chat-message-data.service', useClass: ChatMessageDataService },
        {provide : 'folder-data.service', useClass: FolderDataService},
        {provide : 'const-interface.service', useClass: ConstInterFaceService},
        {provide : 'notification-offLine-message.service', useClass: NotificationOffLineMessageService},
        {provide : 'verification.service', useClass: VerificationService},
        {provide : 'toggle-select.service', useClass: ToggleSelectService},
        {provide : 'bi-translate.service', useClass: BiTranslateService}
      ]
    };
  }
}
