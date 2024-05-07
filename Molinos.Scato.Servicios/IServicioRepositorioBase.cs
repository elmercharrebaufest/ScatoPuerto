using System.Collections.Generic;
using System.ServiceModel;

namespace Molinos.Scato.Servicios
{
	public interface IServicioRepositorioBase<TEntity, TDto>
		where TEntity : class
		where TDto : class
	{
		[OperationContract]
		List<TDto> ListarByFK(long Id);
	}
}
