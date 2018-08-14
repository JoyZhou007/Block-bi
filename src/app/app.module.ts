import { BrowserModule } from "@angular/platform-browser";
import { APP_BASE_HREF, LocationStrategy, PathLocationStrategy } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Http, HttpModule } from "@angular/http";
import { NgModule } from "@angular/core";
import { routing } from "./app.routes";

import { SharedModule } from "./shared/shared.module";
import { NotificationModule } from "./notification/notification.module";
import { NgIdleKeepaliveModule } from "@ng-idle/keepalive";
import { DynamicLoadModule } from "./common/dynamic-load.module";
/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from "./environment";
// App is our top level component
import { AppComponent } from "./app.component";
import { APP_RESOLVER_PROVIDERS } from "./app.resolver";
import { AppState, InternalStateType } from "./app.service";
import { AuthGuard } from "./_authGuard/index";
import { WindowRef } from "./WindowRef";
import { ChatNewModule } from "./chat-new/chat.module";

import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { HomeModule } from "./home/home.module";

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState
];

const SCROLL_CONFIG: PerfectScrollbarConfigInterface = {
  wheelSpeed: .6
};

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: Http) {
  // default: /assets/i18n/en.json
  return new TranslateHttpLoader(http);
  // /public/lang-files/en-lang.json
  // return new TranslateHttpLoader(http, "/public/lang-files/", "-lang.json");
}


/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [
    AppComponent
  ],
  declarations: [
    AppComponent
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    FormsModule,
    HttpModule,
    HomeModule,
    NgIdleKeepaliveModule.forRoot(),
    PerfectScrollbarModule.forRoot(SCROLL_CONFIG),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    SharedModule.forRoot(),
    DynamicLoadModule.forRoot(),
    ChatNewModule.forRoot(),
    NotificationModule.forRoot(),
    routing
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    AuthGuard,
    WindowRef,
    ENV_PROVIDERS,
    APP_PROVIDERS,
    {provide: APP_BASE_HREF, useValue: '/'},
    {provide: LocationStrategy, useClass: PathLocationStrategy}
  ]
})
export class AppModule {

  constructor() {
  }
}

