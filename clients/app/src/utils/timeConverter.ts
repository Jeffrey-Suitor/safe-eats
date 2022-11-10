export const cookingTimeUnits = ["Sec", "Min", "Hour"] as const;
export const expiryDateUnits = ["Hour", "Day", "Week"] as const;

type combinedUnits =
  | typeof cookingTimeUnits[number]
  | typeof expiryDateUnits[number];

const unitShortToLong: { [key in combinedUnits]: string } = {
  Sec: "Second",
  Min: "Minute",
  Hour: "Hour",
  Day: "Day",
  Week: "Week",
};

const unitsInMilliseconds: { [key in combinedUnits]: number } = {
  Week: 604800000,
  Day: 86400000,
  Hour: 3600000,
  Min: 60000,
  Sec: 1000,
};

export const unitToLong = (val: number, unit: combinedUnits) => {
  const longUnit = unitShortToLong[unit];
  return val === 1 ? longUnit : longUnit + "s";
};

export const unitsToMilliseconds = (
  val: number,
  unit: typeof cookingTimeUnits[number] | typeof expiryDateUnits[number]
): number => {
  return val * unitsInMilliseconds[unit];
};

export const millisecondsToUnits = (
  seconds: number
): {
  val: number;
  unit: combinedUnits;
} => {
  for (const unitUnTyped in unitsInMilliseconds) {
    const unit = unitUnTyped as combinedUnits;
    if (seconds % unitsInMilliseconds[unit] === 0) {
      return {
        val: seconds / unitsInMilliseconds[unit],
        unit,
      };
    }
  }
  return { val: seconds, unit: "Sec" };
};
