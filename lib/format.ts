const INDONESIAN_DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(date: Date | string | null | undefined): string {
  if (date === null || date === undefined || date === "") {
    return "-";
  }

  const parsedDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return INDONESIAN_DATE_FORMATTER.format(parsedDate);
}

export function isExpired(
  deadline: Date | string | null | undefined,
  status: string,
  now: Date = new Date(),
): boolean {
  if (
    status === "CLOSED" ||
    status === "CANCELLED" ||
    deadline === null ||
    deadline === undefined ||
    deadline === ""
  ) {
    return false;
  }

  const parsedDeadline =
    deadline instanceof Date ? deadline : new Date(deadline);
  if (Number.isNaN(parsedDeadline.getTime())) {
    return false;
  }

  return parsedDeadline.getTime() < now.getTime();
}
