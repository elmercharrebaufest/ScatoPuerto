# ScatoPuertoApiCore - Guía de Instalación

**CONTEXTO**

Esta API desarrollada en .NET 8 permite la interacción con servicios externos como ARCA (ex AFIP). A continuación se detallan los pasos necesarios para su instalación, configuración y prueba.

---

**PRE-REQUISITOS**

1. Instalar el Hosting Bundle 8.0.11 desde:
   https://dotnet.microsoft.com/en-us/download/dotnet/8.0

   Esto instalará:
   - Microsoft.NETCore.App 8.0.11
   - Microsoft.AspNetCore.App 8.0.11

![alt text](image-1.png)

---

**DESPLIEGUE DE LA APLICACIÓN**

Opción A: Manual desde Visual Studio
1. Usar la acción "Publish" en Visual Studio sobre la rama del release.
2. Copiar los archivos generados a D:\Scato\ScatoPuertoApiCore.
3. Adecuar los archivos de configuración para el ambiente correspondiente.

Opción B: Desde Azure DevOps
1. Obtener el release del pipeline de Azure DevOps para el ambiente correspondiente.

*Nota: al momento de este documento no existe automatización para este pipeline.*

---

**CONFIGURACIÓN**

1. Variable de Entorno en web.config

Verificar que esté correctamente seteada la variable ASPNETCORE_ENVIRONMENT:

Para QA1, QA2, QA3:
```xml
<environmentVariable name="ASPNETCORE_ENVIRONMENT" value="QA" />
```

Para Producción:
```xml
<environmentVariable name="ASPNETCORE_ENVIRONMENT" value="PROD" />
```

2. Connection String en application.ENV.json

Verificar que el connection string contenga Trust Server Certificate=true, de lo contrario fallará la conexión contra la base de datos.

Ejemplo para QA2:
```json
"ConnectionStrings": {
    "DefaultConnection": "Data Source=moascatopuertoqa2.c65eyk8w0u6c.us-east-1.rds.amazonaws.com,1433;Initial Catalog=MOAScatoPuertoQA2;Integrated Security=True;Trust Server Certificate=true;"
}
```
Resultado de la ejecución
![alt text](image-2.png)
![alt text](image-3.png)
---

**PRUEBA DE LA API**

1. Acceder a Swagger UI:
   http://localhost/ScatoPuertoApiCore/swagger/index.html

2. Probar el endpoint /AFIPApi/ObtenerTicketDeAccesoAFIP usando las siguientes credenciales:
```confidencial
   Usuario: ScatoPuerto
   Contraseña: ServicioExternoPass
```
---

**VERIFICACIÓN DE USO DE URL DESDE Scato.ServiciosWeb**

Asegurarse que se esté llamando a la API correcta. Verificar la entrada en Web.config de Scato.ServiciosWeb, en la sección "appSettings" con la key "UrlAfipApi".

Ejemplo para QA1:
<add key="UrlAfipApi" value="https://scatopuertoqa.molinosagro.com.ar/Scato.PuertoApiCore/AFIPApi/" />

![alt text](image-4.png)

---

**NOTAS**

- Revisar que los archivos de configuración estén correctamente adaptados para cada ambiente.
- Validar que los servicios externos estén accesibles desde el entorno donde se despliega la API.
