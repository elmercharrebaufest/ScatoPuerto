namespace Molinos.Scato.Servicios.AFIP
{
    public interface IAfipClient
    {
        ResponseTicketAccesoAfip GetTicketAccesoAfip(string servicio = null);
    }
}