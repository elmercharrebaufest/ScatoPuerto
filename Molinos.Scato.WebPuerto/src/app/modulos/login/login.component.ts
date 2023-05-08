import { Component, OnInit } from '@angular/core';
import { AutenticadorService } from '@ScatoServicios/autenticador.service';
import { Session } from 'protractor';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private autenticar: AutenticadorService) { }

  ngOnInit(): void {
  }
  titulo = "";
  loginResponse: any;
  username = "";
  pass = "";
  loginButtonEnable = true;
  captchaOk: any = null;

public iniciarSession()
{
  this.username=(window.document.getElementsByName("email")[0] as HTMLInputElement).value;
  this.pass= (window.document.getElementsByName("Contraseña")[0]as HTMLInputElement).value;
  this.autenticar.autenticarUsuarioAd(this.username, this.pass).subscribe((res: any) => {

  });
}

}
