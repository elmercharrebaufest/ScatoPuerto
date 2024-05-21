import { Injectable } from '@angular/core';
import { IPublicClientApplication, PublicClientApplication, Configuration, BrowserCacheLocation } from '@azure/msal-browser';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MsalConfigService {
  private clientConfig = {
    '1': environment.clientIdMoa,
    '2': environment.clientIdMoc
  };

  private authorityConfig = {
    '1': environment.authorityMoa,
    '2': environment.authorityMoc
  };

  constructor() {}

  public createMsalInstance(companyId: string): IPublicClientApplication {
    const config: Configuration = {
      auth: {
        clientId: this.clientConfig[companyId],
        redirectUri: environment.redirectUri,
        postLogoutRedirectUri: environment.postLogoutRedirectUri,
        authority: this.authorityConfig[companyId],
      },
      cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
        storeAuthStateInCookie: false,
      }
    };
    return new PublicClientApplication(config);
  }
}