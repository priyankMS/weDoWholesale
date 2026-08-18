export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 mb-1 text-[0.72rem] font-semibold text-red-600" role="alert">
      {message}
    </p>
  );
}
