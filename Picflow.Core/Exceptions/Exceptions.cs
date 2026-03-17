namespace Picflow.Core.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string entidad, string id)
        : base($"{entidad} con id '{id}' no fue encontrado.") { }

    public NotFoundException(string message) : base(message) { }
}

public class ValidationException : Exception
{
    public List<string> Errores { get; }

    public ValidationException(string message) : base(message)
    {
        Errores = [message];
    }

    public ValidationException(List<string> errores)
        : base("Se encontraron errores de validación.")
    {
        Errores = errores;
    }
}

public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message = "No autorizado.") : base(message) { }
}

public class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}
