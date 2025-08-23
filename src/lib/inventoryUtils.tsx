export const normalizeId = (id: string | number | undefined) => String(id ?? '');

export const toApiId = (id?: string | number) => {
  if (id === undefined || id === null || id === '') return id;
  const s = String(id);
  const n = Number(s);
  return Number.isFinite(n) ? n : s;
};

export const resolveAdjustedByName = (a: any) => {
  const candidates = [
    a.adjusted_by_name,
    a.adjusted_by?.full_name,
    a.adjusted_by?.fullName,
    a.staff?.full_name,
    a.staff?.name,
    a.performed_by,
    a.user
  ];

  for (const c of candidates) {
    if (!c) continue;
    const s = String(c).trim();
    if (!s) continue;
    if (/^#?\d+$/.test(s)) continue;
    return s;
  }
  return null;
};
