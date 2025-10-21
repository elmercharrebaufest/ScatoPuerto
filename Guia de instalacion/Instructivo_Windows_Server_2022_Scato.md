
# 📘 Instructivo: Configuración de Windows Server 2022 Datacenter para ejecutar la aplicación Scato Puerto

Este documento describe cómo preparar un servidor con **Windows Server 2022 Datacenter** para ejecutar correctamente la aplicación.

> ℹ️ **Requisito previo:**  
> La aplicación requiere que **.NET Framework 4.8.1** esté instalado en el servidor antes de continuar con la configuración.  
> (.NET Framework 4.8.1 no viene incluido por defecto en Windows Server 2022)

---

## 🧭 Paso 1: Iniciar el asistente de instalación de roles y características

1. Abrir **Server Manager**.
2. En la pantalla inicial, hacer clic en **"2 Add roles and features"**.
3. En el paso **Installation Type**, seleccionar la opción por defecto:  
   ✅ **"Role-based or feature-based installation"**
4. En el paso **Server Selection**, elegir la opción por defecto:  
   ✅ **"Select a server from the server pool"**  
   y seleccionar el servidor actual (debería estar marcado por defecto).

---

## 📦 Paso 2: Selección de roles (Server Roles)

### ✅ File and Storage Services
- **File and iSCSI Services**
  - File Server
- **Storage Services**

### ✅ Web Server (IIS)
> ⚠️ **Importante:**  
> Durante esta primera selección, solo estará visible y seleccionable el rol principal **Web Server (IIS)**.  
> Las configuraciones internas (como autenticaciones, compresión, logging, etc.) se habilitan más adelante en el paso **"Role Services"**, una vez seleccionado el rol principal. No es posible expandirlo o modificarlo aún.

---

## ⚙️ Paso 3: Selección de características (Features)

Seleccionar:

### ✅ .NET Framework
- **.NET Framework 3.5 Features**
  - .NET Framework 3.5 (includes .NET 2.0 and 3.0)
  - HTTP Activation
- **.NET Framework 4.8 Features**
  - .NET Framework 4.8
  - ASP.NET 4.8
  - WCF Services
    - HTTP Activation
    - Message Queuing (MSMQ) Activation
    - Named Pipe Activation
    - TCP Activation
    - TCP Port Sharing

### ✅ Message Queuing (MSMQ)
- Message Queuing Services
  - Message Queuing Server

### ✅ Network Load Balancing

### ✅ Remote Differential Compression

### ✅ Remote Server Administration Tools
- Feature Administration Tools
  - SMTP Server Tools
  - Network Load Balancing Tools
  - SNMP Tools
- Role Administration Tools
  - AD DS and AD LDS Tools
    - Active Directory module for Windows PowerShell
    - AD DS Tools
      - Active Directory Administrative Center
      - AD DS Snap-Ins and Command-Line Tools
    - AD LDS Snap-Ins and Command-Line Tools
  - Hyper-V Management Tools
    - Hyper-V GUI Management Tools
    - Hyper-V Module for Windows PowerShell
  - Remote Desktop Services Tools
  - Windows Server Update Services Tools
    - API and PowerShell cmdlets
    - User Interface Management Console

### ✅ SMB 1.0/CIFS File Sharing Support
- SMB 1.0/CIFS Client
- SMB 1.0/CIFS Server

### ✅ SNMP Service

### ✅ System Data Archiver

### ✅ Telnet Client

### ✅ Windows PowerShell
- Windows PowerShell 5.1
- Windows PowerShell 2.0 Engine

### ✅ Windows Process Activation Service
- Process Model
- .NET Environment 3.5
- Configuration APIs

### ✅ WoW64 Support

### ✅ XPS Viewer

---

## 🌐 Paso 4: Configuración del rol Web Server (IIS)

Después del paso de "Features", el asistente mostrará el paso **"Web Server Role (IIS)" → "Role Services"**. Aquí es donde se configuran las opciones internas del IIS. Seleccionar:

### ✅ Web Server
- **Common HTTP Features**
  - Default Document
  - Directory Browsing
  - HTTP Errors
  - Static Content
  - HTTP Redirection
- **Health and Diagnostics**
  - HTTP Logging
  - Logging Tools
  - ODBC Logging
  - Request Monitor
- **Performance**
  - Static Content Compression
- **Security**
  - Request Filtering
  - Basic Authentication
  - Client Certificate Mapping Authentication
  - Digest Authentication
  - IIS Client Certificate Mapping Authentication
  - IP and Domain Restrictions
  - URL Authorization
  - Windows Authentication
- **Application Development**
  - .NET Extensibility 3.5
  - .NET Extensibility 4.8
  - ASP.NET 4.8
  - ISAPI Extensions
  - ISAPI Filters
  - WebSocket Protocol

### ✅ Management Tools
- IIS Management Console
- IIS 6 Management Compatibility
  - IIS 6 Metabase Compatibility
  - IIS 6 Management Console
  - IIS 6 Scripting Tools
  - IIS 6 WMI Compatibility
- IIS Management Scripts and Tools
- Management Service

---

## 🔧 Paso 5: Instalar módulos adicionales para IIS

### 🔹 URL Rewrite
- Descargar desde el sitio oficial de Microsoft:  
  [https://www.iis.net/downloads/microsoft/url-rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
- Instalar normalmente (no requiere configuración posterior).
- Es requerido por el frontend desarrollado en Angular 10 para permitir el enrutamiento desde el servidor.

### 🔹 Web Deploy (versión más reciente)
- Descargar desde el sitio oficial de Microsoft:  
  [https://www.iis.net/downloads/microsoft/web-deploy](https://www.iis.net/downloads/microsoft/web-deploy)
- Durante la instalación, seleccionar la opción **"Complete"**.
- Es necesario para automatizar despliegues mediante pipelines.

> 📌 Opcional pero recomendado: ejecutar `iisreset` en una consola CMD abierta como administrador después de instalar estos módulos, para asegurarse de que los cambios se apliquen correctamente:
```cmd
iisreset
```

---

## 🏗️ Paso 6: Configuración en IIS

### 1. Crear el Application Pool "Scato"
- Ir a **Application Pools** > clic derecho > **Add Application Pool...**
  - **Name:** `Scato`
  - **.NET CLR Version:** v4.0.30319
  - **Managed Pipeline Mode:** Integrated
  - ✅ **Start application pool immediately**

Luego:
- Clic derecho en el pool "Scato" > **Advanced Settings...**
  - **Start Mode:** AlwaysRunning
  - **Identity:** Custom account → Set → ingresar usuario y contraseña configurados

---

### 2. Eliminar el sitio por defecto
- En **Sites**, eliminar `Default Web Site`.

---

### 3. Crear el sitio "Scato"
- Copiar los archivos del sitio al servidor (en una ruta fija, por ejemplo `C:\inetpub\scato`)
- En **Sites** > clic derecho > **Add Website...**
  - **Site name:** `Scato`
  - **Application Pool:** `Scato`
  - **Physical path:** ruta a los archivos copiados
  - **Binding:** configurar HTTP temporalmente, luego se ajusta a HTTPS

Una vez creado:

#### Convertir carpetas a aplicaciones
- Dentro del sitio, hacer clic derecho en cada una de las siguientes carpetas y seleccionar **"Convert to Application"**:
  - `Scato.ServiciosWeb`
  - `Scato.WebPuerto`
  - `Scato.WebPuertoApi`

---

### 4. Configurar HTTPS
- En el árbol del sitio "Scato", clic derecho > **Edit Bindings...**
  - Agregar un nuevo binding:
    - **Type:** `https`
    - **IP Address:** `All Unassigned`
    - **Port:** `443`
    - **Host name:** el provisto por DNS


---

### 5. Publicar cambios de Base de datos
- Conectarse a VPN
- Abrir la solución en Visual Studio y buscar el proyecto.
- Ir al archivo `03 Repository > Molinos.Scato.Database > Molinos.Scato.Database.SQL_[ENV]_AZ.Puerto.publish.xml`
  - En caso de no existir, debe crearse el archivo copiando uno ya existente.
  - Hacer click derecho al nuevo archivo y seleccionar Abrir con > Editor XML (Texto)
  - Realizar los siguientes cambios:
    - Seleccionar en **TargetDatabaseName** el nombre de la base de datos a utilizar
    - En **TargetConnectionString** cambiar los valores de `Data Source`, `User ID` y `Password`
- Realizar doble click sobre el archivo y presionar **"Generar Script"** para ver los cambios
- En caso de que los cambios sean correctos, se puede optar por una de las siguientes acciones:
  - Copiar los script de cambios generados y ejecutar manualmente en la base de datos
  - Volver a hacer doble click en el archivo y esta vez presionar **"Publicar"** en lugar de "Generar Script"

---

### 6. (Opcional) Generación de parámetros para nuevos ambientes

### Backend
- Duplicar uno de los archivos existentes en `02 Services > Molinos.Scato.WebPuertoApi > SCATOPUERTO[NombreAmbiente].DeployParameters.xml`
  - De ser necesario modificar el parametro `WebPuertoApiPassword`
  - En caso de modificarlo, tener en cuenta que tendrá que ser cambiado también para el frontend
- Duplicar uno de los archivos existentes en `02 Services > Molinos.Scato.ServiciosWeb > SCATOPUERTO[NombreAmbiente].DeployParameters.xml`
  - Modificar el valor del parámetro que contiene el **ConnectionString** con los valores de la base de datos correspondiente
  - Revisar otros parámetros según la necesidad (Ej: SAP, AFIP, Orquestador)

### Frontend
- Duplicar uno de los archivos existentes en `src > environment > environment.NombreAmbiente.ts`
  - Reemplazar los parámetros por los valores correspondientes al nuevo ambiente
    - El parámetro **"webPuertoApiPassword"** deberá coincidir con el especificado en `02 Services > Molinos.Scato.WebPuertoApi > SCATOPUERTO[NombreAmbiente].DeployParameters.xml`
- Abrir el archivo `angular.json`
  - Duplicar uno parametros de ambiente, junto con su contenido, encontrado en `projects > web-puerto > architect > build > configurations > nombreAmbiente`
    - Cambiar el nombre del parametro por el nombre correspondiente del ambiente
    - Cambiar dentro de `fileReplacements` el parámetros `with` indicando la ruta del archivo creado en el primer paso
  - Duplicar uno de los parametros de ambiente, junto con su contenido, encontrado en `projects > web-puerto > architect > serve > configurations > nombreAmbiente`
    - Cambiar el nombre del parametro por el nombre correspondiente del ambiente
    - Cambiar en el parámetro `browserTarget` la parte final del valor para que coincida con el nombre del nuevo ambiente
  - Duplicar uno de los parámetros, junto con su contenido, encontrado en `projects > web-puerto > architect > e2e > configurations > nombreAmbiente`
    - Cambiar el nombre del parámetro por el nombre correspondiente del ambiente
    - Cambiar en el parámetro `devServerTarget` la parte final del valor para que coincida con el nombre del nuevo ambiente
- Ir al pipeline creado para el build este nuevo ambiente
  - En el paso `Run ng`, en la sección de `Arguments` colocar el nombre del ambiente en  `--configuration=nombreAmbiente`. Debe coincidir con el especificado en el archivo `angular.json`