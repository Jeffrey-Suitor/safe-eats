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

const unitsInSeconds: { [key in combinedUnits]: number } = {
  Week: 604800,
  Day: 86400,
  Hour: 3600,
  Min: 60,
  Sec: 1,
};

export const unitToLong = (val: number, unit: combinedUnits) => {
  const longUnit = unitShortToLong[unit];
  return val === 1 ? longUnit : longUnit + "s";
};

export const unitsToSeconds = (
  val: number,
  unit: typeof cookingTimeUnits[number] | typeof expiryDateUnits[number]
): number => {
  return val * unitsInSeconds[unit];
};

export const secondsToUnits = (
  seconds: number
): {
  val: number;
  unit: combinedUnits;
} => {
  for (const unitUnTyped in unitsInSeconds) {
    const unit = unitUnTyped as combinedUnits;
    if (seconds % unitsInSeconds[unit] === 0) {
      return {
        val: seconds / unitsInSeconds[unit],
        unit,
      };
    }
  }
  return { val: seconds, unit: "Sec" };
};
