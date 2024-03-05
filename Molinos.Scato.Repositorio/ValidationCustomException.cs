using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Repositorio
{
    public class ValidationCustomException : Exception
    {
        public ValidationCustomException() : base()
        {
        }

        public ValidationCustomException(string message) : base(message)
        {
        }

        public ValidationCustomException(string message, Exception innerException) :
                base(message, innerException)
        {
        }
    }
}
