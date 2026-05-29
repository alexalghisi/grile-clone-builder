const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full bg-red-100 border-b border-red-300 px-4 py-2 text-center text-sm text-red-800">
        Plățile reale nu sunt încă activate. Finalizează go-live din panoul Lovable pentru a accepta plăți.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-sm text-amber-900">
        Plățile sunt în <strong>mod test</strong>. Folosește cardul <code className="font-mono">4242 4242 4242 4242</code> pentru a testa.
      </div>
    );
  }
  return null;
}