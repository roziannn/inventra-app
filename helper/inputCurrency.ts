export const inputCurrency = (value: string) => {
  return value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
