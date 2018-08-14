import { Routes } from "@angular/router";
//workflow
import { ChatHelpComponent } from "./component/chat-help.component";
import { ChatPostHelpComponent } from "./component/post-help.component";

export const routes: Routes = [
  {
    path: 'help-chat',
    component: ChatHelpComponent,
  },
  {
    path: 'help-post',
    component: ChatPostHelpComponent,
  }
];