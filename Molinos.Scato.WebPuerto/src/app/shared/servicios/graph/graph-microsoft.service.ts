import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable, throwError, forkJoin  } from "rxjs";
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GraphMicrosoftService {
  url: string = environment.apiGraph;

  constructor(
    private http: HttpClient,
  ) { }

  cargarRoles = async (token: string) => {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ConsistencyLevel': 'eventual',
      'Accept': 'application/json'
    });

    const apiMicrosoftGraphGroupLAD = `${this.url}me/memberOf/microsoft.graph.group?$search="displayName:LAD_MOAAPP_PUERTO"&$select=displayName`;
    const apiMicrosoftGraphGroupLAA = `${this.url}me/memberOf/microsoft.graph.group?$search="displayName:LAA_MOAAPP_CCTVAxis_User_AduanaSL"&$select=displayName`;
    
    console.log(' request URL LAD:', apiMicrosoftGraphGroupLAD);
    console.log(' request URL LAA:', apiMicrosoftGraphGroupLAA);
    console.log(' request Headers:', headers);

    return await forkJoin([
      this.http.get<any>(apiMicrosoftGraphGroupLAD, { headers }),
      this.http.get<any>(apiMicrosoftGraphGroupLAA, { headers })
    ]).pipe(
        map(([responseLAD, responseLAA]) => {
          console.log(' response LAD:', responseLAD);
          console.log(' response LAA:', responseLAA);
          const rolesLAD = responseLAD.value ? responseLAD.value.map(item => item.displayName) : [];
          const rolesLAA = responseLAA.value ? responseLAA.value.map(item => item.displayName) : [];
          return [...rolesLAD, ...rolesLAA];
        }),
        catchError(error => {
          console.error('Error:', error);
          return throwError(error);
        })
      );
  }
}
