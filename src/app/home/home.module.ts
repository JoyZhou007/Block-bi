/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/9/12.
 */

import { NgModule } from "@angular/core";
import { UserLoginComponent } from "./component/user-login.component";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../shared/shared.module";
import { FormsModule } from "@angular/forms";
import { UserAboutComponent } from "./component/user-about-us.component";
import { UserProductComponent } from "./component/user-product.component";
import { UserBlogComponent } from "./component/user-blog.component";
import { UserResetPsdComponent } from "./component/user-reset-psd.component";
import { UserContactComponent } from "./component/user-contact.component";
import { UserFooterComponent } from "./component/user-footer.component";
import { UserRecoverPsdComponent } from "./component/user-recover-psd.component";
import { UserPriceComponent } from "./component/user-price.component";
import { UserLogoutComponent } from "./component/user-logout.component";
import { UserOauthLoginComponent } from "./component/user-oauth-login.component";
import { UserRegisterComponent } from "./component/user-register.component";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { CompanyModelService } from "../shared/services/model/company-model.service";

import {
  UserModelService,
  ContactModelService,
  NotificationModelService
} from "../shared/services/index.service";
import { HomeHeaderComponent } from "./component/home-header.component";
import { routes } from "./home.route";


@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    PerfectScrollbarModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    HomeHeaderComponent,
    UserLoginComponent,
    UserRegisterComponent,
    UserLogoutComponent,
    UserAboutComponent,
    UserProductComponent,
    UserPriceComponent,
    UserBlogComponent,
    UserResetPsdComponent,
    UserRecoverPsdComponent,
    UserFooterComponent,
    UserContactComponent,
    UserOauthLoginComponent
  ],
  exports: [
    HomeHeaderComponent
  ],
  providers: [
    UserModelService,
    CompanyModelService,
    ContactModelService,
    NotificationModelService
  ],
  bootstrap: [UserLoginComponent]
})
export class HomeModule {

}