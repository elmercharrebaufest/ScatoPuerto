import { Injectable, OnDestroy } from '@angular/core';
import { Usuario } from '../interfaces/usuario';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnDestroy {
  
  isLoggedIn: boolean = false

  constructor(private router: Router) {
    // Start listening to storage events
    this.start()
  }

  setUser(user: Usuario){
    this.isLoggedIn = true 
    sessionStorage.setItem("user", JSON.stringify(user));
  }

  getUser() : any {
    return JSON.parse(sessionStorage.getItem("user"));
  }
  
  clear() {
    sessionStorage.clear();
  }

  public login = () => {
    this.isLoggedIn = true;
    this.router.navigate(['']);
  }

  public logOut = () => {
    this.isLoggedIn = false;
    this.clear();
    this.router.navigate(['/login']); 
  }

  // Bind the eventListener
  private start(): void {
    window.addEventListener("storage", this.storageEventListener.bind(this));
  }

  // Logout only when key is 'logout-event'
  private storageEventListener(event: StorageEvent) {
    if (event.storageArea == localStorage) {
      if (event?.key && event.key == 'logout-event') {
        console.log("🔥 ~ storageEventListener ~ event", event.newValue)
        this.logOut()  
      }
    }
  }

  // Handle active listeners when onDestroy 
  private stop(): void {
    window.removeEventListener("storage", this.storageEventListener.bind(this));
  }

  ngOnDestroy() {
    this.stop()
  }

}
