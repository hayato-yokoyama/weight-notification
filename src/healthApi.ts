import { format, subDays } from "date-fns";

export const fetchWeightData = async () => {
  const url = "https://www.healthplanet.jp/status/innerscan.json";
  /** 15日前（YYYYMMDD000000） */
  const date15DaysAgo = format(subDays(new Date(), 15), "yyyyMMdd") + "000000";
  /** 1日前（YYYYMMDD000000） */
  const date1DayAgo = format(subDays(new Date(), 1), "yyyyMMdd") + "000000";

  const params = {
    access_token: process.env.HEALTH_PLANET_ACCESS_TOKEN as string,
    date: "1",
    from: date15DaysAgo,
    to: date1DayAgo,
    tag: "6021",
  };

  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${url}?${query}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from Health Planet API", error);
    throw error;
  }
};
