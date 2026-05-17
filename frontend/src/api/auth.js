const API_URL = "/auth";

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Niepoprawne dane logowania");
  }

  return res.json();
};

export const register = async (username, password) => {
  const res = await fetch(`${API_URL}/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Błąd rejestracji");
  }

  return res.json();
};

export const resetPassword = async (email) => {
  const res = await fetch(`${API_URL}/reset-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("Nie udało się zresetować hasła");
  }

  return res.json();
};
