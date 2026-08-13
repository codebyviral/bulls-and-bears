export const formatCurrency = (number) => {
  const price = Number(number).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    style: "currency",
    currency: "INR",
  });
  return price;
};
