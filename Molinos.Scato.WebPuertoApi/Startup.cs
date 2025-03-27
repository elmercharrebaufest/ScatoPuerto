//using Microsoft.Owin;
//using Microsoft.Owin.Security.Jwt;
//using Microsoft.Owin.Security.OAuth;
//using Owin;
//using System;
//using System.Text;
//using System.Web.Http;

//[assembly: OwinStartup(typeof(Molinos.Scato.WebPuertoApi.Startup))]

//namespace Molinos.Scato.WebPuertoApi
//{
//    public class Startup
//    {
//        public void Configuration(IAppBuilder app)
//        {
//            // Configura Web API
//            var config = new HttpConfiguration();
//            WebApiConfig.Register(config);  // Llama la configuración de rutas desde WebApiConfig
//            app.UseWebApi(config);

//            // Configura la autenticación JWT
//            ConfigureAuth(app);
//        }

//        private void ConfigureAuth(IAppBuilder app)
//        {
//            var issuer = "https://your-issuer.com"; // Reemplaza con el emisor de tu token
//            var audience = "your-audience"; // Reemplaza con la audiencia de tu API
//            var secretKey = Encoding.UTF8.GetBytes("your-secret-key"); // Clave secreta para validar el JWT

//            // Configura el middleware de autenticación JWT
//            app.UseJwtBearerAuthentication(new JwtBearerAuthenticationOptions
//            {
//                AuthenticationMode = Microsoft.Owin.Security.AuthenticationMode.Active,
//                TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
//                {
//                    ValidateIssuer = true,
//                    ValidateAudience = true,
//                    ValidateLifetime = true,
//                    ValidIssuer = issuer,
//                    ValidAudience = audience,
//                    IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(secretKey)
//                }
//            });
//        }
//    }
//}
