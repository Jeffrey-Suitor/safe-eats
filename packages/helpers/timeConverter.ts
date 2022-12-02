export const cookingTimeUnits = ["Sec", "Min", "Hour"] as const;
export const expiryDateUnits = ["Min", "Hour", "Day", "Week"] as const;

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
  seconds: number,
  unitTypes: "cookingTime" | "expiryDate" | "all"
): { val: number; unit: combinedUnits } => {
  const getUnitTypes = () => {
    switch (unitTypes) {
      case "cookingTime":
        return [...cookingTimeUnits];
      case "expiryDate":
        return [...expiryDateUnits];
      case "all":
        return [...cookingTimeUnits, ...expiryDateUnits];
    }
  };

  const unorderedUnits = getUnitTypes();

  const units = unorderedUnits
    .sort((a, b) => unitsInMilliseconds[b] - unitsInMilliseconds[a]) // Order by largest to smallest
    .filter((v, i, a) => a.indexOf(v) === i); // Get only unique values

  for (const unit of units) {
    if (seconds % unitsInMilliseconds[unit] === 0) {
      return {
        val: seconds / unitsInMilliseconds[unit],
        unit,
      };
    }
  }
  return { val: seconds, unit: "Sec" };
};

export const msToHMS = (ms: number) => {
  let s = ms / 1000;

  const hours = Math.floor(s / 3600).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  s = s % 3600;

  const minutes = Math.floor(s / 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const seconds = Math.round(s % 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  return hours + ":" + minutes + ":" + s;
};
