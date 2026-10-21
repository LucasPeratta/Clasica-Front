import { iService } from "../../Service/model";

export const CURRENCIES = [
  { value: "PESOS", label: "Pesos", symbol: "$" },
  { value: "USD", label: "USD", symbol: "USD" },
  { value: "EURO", label: "Euros", symbol: "€" },
] as const;

export interface iCurrencyTotal {
  currency: string;
  label: string;
  neto: number;
  tarifa: number;
}

/**
 * Suma precio neto y tarifa de los servicios separando por moneda (nunca mezcla monedas)
 */
export function getTotalsByCurrency(
  services: Pick<iService, "precioNeto" | "tarifa" | "currency">[] = []
): iCurrencyTotal[] {
  return CURRENCIES.map(({ value, label }) => {
    const ofCurrency = services.filter((s) => s.currency === value);
    return {
      currency: value,
      label,
      neto: ofCurrency.reduce((sum, s) => sum + (Number(s.precioNeto) || 0), 0),
      tarifa: ofCurrency.reduce((sum, s) => sum + (Number(s.tarifa) || 0), 0),
    };
  });
}

/**
 * Formatea un importe con el símbolo de su moneda, ej. "$ 500.000,00" o "USD 1.250,50"
 */
export function formatMoney(amount: number, currency: string): string {
  const symbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? currency;
  const number = amount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${number}`;
}
