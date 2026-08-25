using System;

namespace TaskFlow.API.Exceptions
{
    public class AiServiceException : Exception
    {
        public AiServiceException(string message) : base(message) { }
        public AiServiceException(string message, Exception innerException) : base(message, innerException) { }
    }
}
