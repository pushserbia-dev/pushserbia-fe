import { APP_INITIALIZER, ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import * as Sentry from '@sentry/angular';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideFirebase } from './core/firebase/firebase.provider';
import { authInterceptor } from './core/auth/auth.interceptor';
import { apiInterceptor } from './core/api/api.interceptor';
import { provideApiEndpointUrl } from './core/providers/api-endpoint-url.provider';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideApiEndpointUrl(environment.apiUrl),
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor, authInterceptor])),
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler(),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
    // todo: https://docs.sentry.io/platforms/javascript/guides/angular/sourcemaps/
    provideFirebase(),
  ]
};
