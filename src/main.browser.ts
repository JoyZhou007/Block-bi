/*
 * Angular bootstraping
 */
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { decorateModuleRef } from './app/environment';
import { bootloader } from '@angularclass/hmr';
// Load i18n providers
// import { TranslationProviders } from './i18n.providers';

/*
 * App Module
 * our top level module that holds all of our components
 */
import { AppModule } from './app/app.module';

/*
 * Bootstrap our Angular app with a top level NgModule
 */
export function main() {
  return platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then(decorateModuleRef)
    .catch((err) => console.error(err));
}

// needed for hmr
// in prod this is replace for document ready
bootloader(main);
