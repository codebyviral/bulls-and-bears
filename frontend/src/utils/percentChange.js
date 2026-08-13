  // Calculate percentage change
export  const calculatePercentageChange = (current, open) => {
    if (!open || open === 0) return 0;
    return ((current - open) / open) * 100;
  };
