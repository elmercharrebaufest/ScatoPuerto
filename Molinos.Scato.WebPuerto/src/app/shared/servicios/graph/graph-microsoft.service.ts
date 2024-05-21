import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable, throwError  } from "rxjs";
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

    const apiMicrosoftGraphGroup = `${this.url}me/memberOf/microsoft.graph.group?$search="displayName:LAD_MOAAPP_PUERTO"&$select=displayName`;
    console.log(' request URL:', apiMicrosoftGraphGroup);
    console.log(' request Headers:', headers);

    return await this.http.get<any>(apiMicrosoftGraphGroup, { headers }).pipe(
        map(response => {
          console.log(' response:', response);
          return response.value.map(item => item.displayName);
        }),
        catchError(error => {
          console.error('Error:', error);
          return throwError(error);
        })
      );
  }
}
