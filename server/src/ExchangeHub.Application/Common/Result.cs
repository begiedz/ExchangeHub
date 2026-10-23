namespace ExchangeHub.Application.Common;

public enum ErrorType
{
    Validation,
    Unauthorized,
    Forbidden,
    NotFound,
    Conflict,
    TooManyRequests,
    ServiceUnavailable,
    UnprocessableEntity
}

public sealed record Error(string Code, string Description, ErrorType Type);

public class Result
{
    protected Result(bool isSuccess, Error? error)
    {
        IsSuccess = isSuccess;
        Error = error;
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error? Error { get; }

    public static Result Success() => new(true, null);
    public static Result Failure(Error error) => new(false, error);
    public static Result<T> Success<T>(T value) => new(value, true, null);
    public static Result<T> Failure<T>(Error error) => new(default, false, error);
}

public sealed class Result<T> : Result
{
    internal Result(T? value, bool isSuccess, Error? error) : base(isSuccess, error) => Value = value;

    public T? Value { get; }

    public static implicit operator Result<T>(Error error) => Failure<T>(error);
    public static implicit operator Result<T>(T value) => Success(value);
}
