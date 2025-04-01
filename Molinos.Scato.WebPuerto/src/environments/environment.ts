// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  envName: 'dev',
  apiUrl: '/api/',
  apiAzureUrl: 'http://localhost/Scato.AzureAD/',
  apiGraph: 'https://graph.microsoft.com/v1.0/',
  clientIdMoa: '94426e34-9e75-401a-9f55-906c5e2c4246',
  clientIdMoc: '5ab4c0b8-bf3b-42ef-90b9-697559762d72',
  redirectUri: 'http://localhost:4200',
  postLogoutRedirectUri: 'http://localhost:4200/login',
  authorityMoa: 'https://login.microsoftonline.com/790c9737-0b8e-4138-a0f4-819cdc1eb64b',
  authorityMoc: 'https://login.microsoftonline.com/c5d83817-b680-4929-9c3c-407e37ea2678',
  webPuertoApiUsername:'WebPuertoApi',
  webPuertoApiPassword:'iviabcsWewqdsa32137B'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
