export const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toISOString().split("T")[0];
};

export const formatTime = (isoDate: string) => {
  return new Date(isoDate).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
