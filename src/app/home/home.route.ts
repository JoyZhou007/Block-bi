/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/9/25.
 */
import { UserAboutComponent } from "./component/user-about-us.component";
import { UserProductComponent } from "./component/user-product.component";
import { UserBlogComponent } from "./component/user-blog.component";
import { UserResetPsdComponent } from "./component/user-reset-psd.component";
import { UserPriceComponent } from "./component/user-price.component";
import { UserLogoutComponent } from "./component/user-logout.component";
import { UserOauthLoginComponent } from "./component/user-oauth-login.component";
import { UserRegisterComponent } from "./component/user-register.component";
import { UserLoginComponent } from "./component/user-login.component";

export const routes: any = [
  {
    path: 'home/login',
    component: UserLoginComponent
  },
  {
    path: 'home/register',
    component: UserRegisterComponent
  },
  {
    path: 'home/reset-psd',
    component: UserResetPsdComponent
  },
  {
    path: 'user/logout',
    component: UserLogoutComponent,
  },
  {
    path: 'home/about',
    component: UserAboutComponent
  },
  {
    path: 'home/product',
    component: UserProductComponent
  },
  {
    path: 'home/price',
    component: UserPriceComponent
  },
  {
    path: 'home/blog',
    component: UserBlogComponent
  },
  {
    path: 'home/oauth/login',
    component: UserOauthLoginComponent
  },
];
