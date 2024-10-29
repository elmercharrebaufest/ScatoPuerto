import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedComponentModule } from "./componentes/shared-components.module";
import { RoleGuard } from "./seguridad/role.guard";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedComponentModule,
  ],
  exports: [
    CommonModule,
    SharedComponentModule
  ],
  providers: [RoleGuard]
})
export class SharedModule { }