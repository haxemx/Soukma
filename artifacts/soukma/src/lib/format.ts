export function formatMAD(amount: number | string | null | undefined): string {
  const n = typeof amount === "string" ? Number(amount) : amount ?? 0;
  if (Number.isNaN(n)) return "0 MAD";
  return new Intl.NumberFormat("fr-MA", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n) + " MAD";
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function statusLabel(s: string): string {
  switch (s) {
    case "pending": return "En attente";
    case "paid": return "Payée";
    case "shipped": return "Expédiée";
    case "delivered": return "Livrée";
    case "cancelled": return "Annulée";
    default: return s;
  }
}

export function paymentLabel(s: string): string {
  switch (s) {
    case "cmi": return "Carte CMI";
    case "cih_pay": return "CIH Pay";
    case "cash_on_delivery":
    case "cod": return "Paiement à la livraison";
    default: return s;
  }
}
