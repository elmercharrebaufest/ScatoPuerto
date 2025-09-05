namespace Molinos.Scato.Dominio
{
    public static class Constantes
    {
        public struct IntercomunicadorDireccion
        {
            public const string HaciaLaWeb = "2web";
            public const string DesdeLaWeb = "web2";
        }

        public struct NotificacionGrupos
        {
            public const string Intercomunicador = "Intercomunicador";
        }

        public struct Entidad
        {
            public const string Visteo = "EVIST";
        }

        public struct TipoDeActividad
        {
            public const string Rechazar = "TRECH";
        }

        public struct TipoBalanzada
        {
            public const string Inicio = "inicio";
            public const string Fin = "fin";
            public const string Balanzada = "balanzada";
            public const string Error = "error";
            public const string InicioError = "inicioError";
            public const string Error41 = "error41";
            public const string FinError = "finError";
        }
    }
}
