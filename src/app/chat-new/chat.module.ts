import {NgModule, ModuleWithProviders} from '@angular/core';
import {FormsModule}    from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {QuillModule} from 'ngx-quill';
import {ContactModelService} from "../shared/services/model/contact-model.service";
import {ChatModelService} from "../shared/services/model/chat-model.service";
import {CalendarModule} from '../calendar/calendar.module';
import {TooltipModule} from "../tooltip/tooltip.module";
import {TranslateModule} from "@ngx-translate/core";

//滚动条
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

// 主模块
import {ChatNewComponent} from "./component/chat-new.component";
import {ChatMenuNewComponent} from "./component/chat-menu-new.component";
import {ChatContentNewComponent} from "./component/chat-content-new.component";
import {ChatContentHeaderComponent} from "./component/content/chat-content-header.component";
import {ChatContentDefaultComponent} from "./component/content/chat-content-default.component";
import {ChatContentMessageComponent} from "./component/content/chat-content-message.component";
import {ChatContentSidebarComponent} from "./component/content/chat-content-sidebar.component";
import {ChatPinComponent} from "./component/chat-pin.component";
import {ChatSearchNewComponent} from "./component/chat-search-new.component";

import {ChatCommentsNewComponent} from "./component/chat-comments-new.component";
import {ChatContentDetailComponent} from "./component/content/chat-content-detail.component";
import {ChatPostFilesComponent} from "./component/chat-post-files.component";
import {ChatContentMemberComponent} from "./component/content/chat-content-member.component";
import {ChatMemberDetailComponent} from "./component/chat-member-detail.component";
import {ChatPostNewComponent} from "./component/chat-post.component";
import {ChatPostHeaderComponent} from "./component/post/chat-post-header.component";
import {DropdownModule} from "../dropdown/dropdown.module";
import {ChatContentMessageInputComponent} from "./component/content/chat-content-message-input.component";
import {ChatContentMessageTextComponent} from "./component/content/message/chat-content-message-text.component";
import {DownloadService} from "../shared/services/common/file/download.service";
import {FolderModelService} from "../shared/services/model/folder-model.service";
import {ChatContentMessageImg} from "./component/content/message/chat-content-message-img.component";
import {ChatContentMessageFile} from "./component/content/message/chat-content-message-file.component";
import {ChatContentMessagePostComponent} from "./component/content/message/chat-content-message-post.component";
import {ChatPostReadComponent} from "./component/chat-post-read.component";
import {ChatPostReadModeHeaderComponent} from "./component/post/chat-post-read-mode-header.component";
import {ChatNewImageDialog} from "./component/dialog/chat-new-image-dialog.component";
import {ChatContentForward} from "./component/content/message/chat-content-forward.component";
import {EmojiModule} from "angular-emojione";
import {EmojiPickerModule} from "../bi-emoji-panel/emoji-picker.module";
import {ChatFileCommentsComponent} from './component/content/chat-file-comments.component';

@NgModule({
  imports: [
    FormsModule,
    SharedModule,
    QuillModule,
    DropdownModule,
    CalendarModule,
    TooltipModule,
    TranslateModule,
    EmojiModule,
    EmojiPickerModule,
    PerfectScrollbarModule
  ],
  declarations: [
    ChatNewComponent,
    ChatMenuNewComponent,
    ChatContentNewComponent,
    ChatContentDetailComponent,
    ChatContentHeaderComponent,
    ChatContentDefaultComponent,
    ChatContentMessageComponent,
    ChatContentSidebarComponent,
    ChatContentMessageInputComponent,
    ChatContentMessageTextComponent,
    ChatPinComponent,
    ChatSearchNewComponent,
    ChatContentMemberComponent,
    ChatCommentsNewComponent,
    ChatPostFilesComponent,
    ChatMemberDetailComponent,
    ChatPostNewComponent,
    ChatPostHeaderComponent,
    ChatNewImageDialog,
    ChatContentMessageImg,
    ChatContentMessagePostComponent,
    ChatPostReadComponent,
    ChatPostReadModeHeaderComponent,
    ChatContentMessageFile,
    ChatContentForward,
    ChatFileCommentsComponent
  ],
  exports: [
    ChatNewComponent,
    ChatMenuNewComponent,
    ChatContentNewComponent,
    ChatContentDetailComponent,
    ChatContentHeaderComponent,
    ChatContentDefaultComponent,
    ChatContentMessageComponent,
    ChatContentSidebarComponent,
    ChatContentMessageInputComponent,
    ChatContentMessageTextComponent,
    ChatPinComponent,
    ChatSearchNewComponent,
    ChatContentMemberComponent,
    ChatCommentsNewComponent,
    ChatPostFilesComponent,
    ChatMemberDetailComponent,
    ChatPostNewComponent,
    ChatNewImageDialog,
    ChatContentMessageImg,
    ChatContentMessagePostComponent,
    ChatPostReadComponent,
    ChatPostHeaderComponent,
    ChatPostReadModeHeaderComponent,
    ChatContentMessageFile,
    ChatContentForward,
    ChatFileCommentsComponent
  ],

  providers: [
    ContactModelService,
    ChatModelService,
    DownloadService,
    FolderModelService
  ],
  bootstrap: [ChatNewComponent]
})
export class ChatNewModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ChatNewModule
    };
  }
}
