import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  userEmail: string;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function CancelSubscriptionModal({
  isOpen,
  userEmail,
  onClose,
  onConfirm,
  isSubmitting: externalSubmitting = false,
}: CancelSubscriptionModalProps) {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const [isDev, setIsDev] = useState(false);

  // Combinar o estado interno de submitting com o externo
  const isSubmitting = internalSubmitting || externalSubmitting;

  useEffect(() => {
    // Verificar se estamos em ambiente de desenvolvimento
    setIsDev(process.env.NODE_ENV === "development");
  }, []);

  const handleSubmit = () => {
    setInternalSubmitting(true);

    // Em modo DEV não precisamos verificar o email
    if (isDev || confirmEmail.toLowerCase() === userEmail.toLowerCase()) {
      onConfirm();
    } else {
      setEmailError(true);
      setInternalSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-900/50 rounded-lg shadow-lg max-w-md w-full overflow-hidden">
        <div className="flex justify-between items-center p-5  border-b border-gray-700/50">
          <h3 className="text-lg font-medium text-white">
            Cancelar Assinatura
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 rounded-lg text-gray-300 text-sm">
            <p className="flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 text-red-500 flex-shrink-0" />
              <span>
                <strong className="text-red-400">Atenção:</strong> Cancelar sua
                assinatura resultará na perda imediata de acesso aos recursos
                premium. Essa ação não pode ser desfeita.
              </span>
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {isDev
                ? "Em modo DEV, a verificação de email está desativada"
                : "Digite seu email para confirmar o cancelamento"}
            </label>

            {!isDev && (
              <>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => {
                    setConfirmEmail(e.target.value);
                    setEmailError(false);
                  }}
                  className={`w-full px-4 py-2 bg-gray-800/80 border ${
                    emailError ? "border-red-500" : "border-gray-700"
                  } rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                  placeholder={userEmail}
                />

                {emailError && (
                  <p className="mt-2 text-sm text-red-500">
                    O email não corresponde à sua conta
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex justify-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                (!isDev &&
                  confirmEmail.toLowerCase() !== userEmail.toLowerCase()) ||
                isSubmitting
              }
              className="px-4 py-2 bg-red-700 hover:bg-red-600 disabled:bg-red-900/50 disabled:text-gray-400 text-white rounded-md transition-colors flex items-center"
            >
              {isSubmitting && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              Confirmar Cancelamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
