export function isValidEmail(value: string) {
  const email = value.trim();
  if (email.length > 254) return false;

  const [local, domain, ...extra] = email.split("@");
  if (!local || !domain || extra.length > 0 || local.length > 64) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  if (!/^[a-z\d!#$%&'*+/=?^_`{|}~.-]+$/i.test(local)) return false;

  const domainLabels = domain.split(".");
  if (domainLabels.length < 2) return false;
  return domainLabels.every((label) =>
    label.length > 0 &&
    label.length <= 63 &&
    /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(label),
  );
}

export function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCpf(value: string) {
  const digits = normalizeCpf(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function isValidCpf(value: string) {
  const cpf = normalizeCpf(value);
  if (cpf.length !== 11 || /^([\d])\1{10}$/.test(cpf)) return false;

  const calculateDigit = (base: string, initialWeight: number) => {
    const sum = [...base].reduce((total, digit, index) => total + Number(digit) * (initialWeight - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calculateDigit(cpf.slice(0, 9), 10);
  const secondDigit = calculateDigit(cpf.slice(0, 10), 11);
  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
}
