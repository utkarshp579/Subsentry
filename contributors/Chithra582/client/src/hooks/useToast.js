import { useState } from "react";

export const useToast = () => {
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success", duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), duration);
  };

  return { toast, showToast };
};
