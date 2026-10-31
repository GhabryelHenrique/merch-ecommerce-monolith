import { type ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideSsrTransferCacheOriginMap } from '@merch/core';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes)), provideSsrTransferCacheOriginMap()],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
