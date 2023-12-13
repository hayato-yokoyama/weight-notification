import axios from "axios";
import { format, isWithinInterval, parse, startOfDay, subDays } from "date-fns";
import { FetchData, WeightRecord } from ".";

/** 体重データを取得 */
export const fetchWeight = async () => {
  /** Health Planet API URL */
  const url = "https://www.healthplanet.jp/status/innerscan.json";

  /** 14日前（YYYYMMDD000000） */
  const date14DaysAgo = format(subDays(new Date(), 14), "yyyyMMdd") + "000000";
  /** 1日前（YYYYMMDD235959） */
  const date1DayAgo = format(subDays(new Date(), 1), "yyyyMMdd") + "235959";

  const params = {
    access_token: process.env.HEALTH_PLANET_ACCESS_TOKEN,
    date: "1",
    from: date14DaysAgo,
    to: date1DayAgo,
    tag: "6021",
  };

  try {
    const response = await axios.get(url, { params });
    if (response.status !== 200) {
      throw new Error("Network response was not ok");
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Health Planet API", error);
    throw error;
  }
};

/** 今週分(1~7日前)の体重の平均と先週分との体重の増減を算出 */
export const calcWeightAverageDiff = (fetchData: FetchData) => {
  /** 今週分(1~7日前)の体重と先週分(8~14日前)の体重を分けて取得 */
  const { currentWeekWeight, prevWeekWeight } = separateCurrentAndPrevWeekWeights(fetchData.data);

  /** 今週分(1~7日前)の体重の平均 */
  const currentWeekAverageWeight = calculateAverageWeight(currentWeekWeight);
  /** 先週分(8~14日前)の体重の平均 */
  const prevWeekAverageWeight = calculateAverageWeight(prevWeekWeight);

  /** 体重の増減 */
  const weeklyWeightDiffNumber = currentWeekAverageWeight - prevWeekAverageWeight;
  const weeklyWeightDiff =
    weeklyWeightDiffNumber > 0 ? `+${weeklyWeightDiffNumber.toFixed(2)}` : weeklyWeightDiffNumber.toFixed(2);

  return { currentWeekAverageWeight, weeklyWeightDiff };
};

// 取得した体重データから今週分の体重と先週分の体重を分ける
const separateCurrentAndPrevWeekWeights = (data: WeightRecord[]) => {
  /** 1週間前の0時0分0秒 */
  const oneWeekAgo = startOfDay(subDays(new Date(), 7));

  /** 今週分の体重 */
  const currentWeekWeight = data.filter((record) =>
    isWithinInterval(parseDate(record.date), {
      start: oneWeekAgo,
      end: new Date(),
    })
  );

  /** 先週分の体重 */
  const prevWeekWeight = data.filter(
    (record) =>
      !isWithinInterval(parseDate(record.date), {
        start: oneWeekAgo,
        end: new Date(),
      })
  );

  return { currentWeekWeight, prevWeekWeight };
};

/** 'yyyyMMddHHmm' 形式の文字列をDateオブジェクトに変換 */
const parseDate = (dateStr: string): Date => {
  return parse(dateStr, "yyyyMMddHHmm", new Date());
};

/** 体重の平均を算出 */
const calculateAverageWeight = (data: WeightRecord[]) => {
  if (data.length === 0) {
    return 0;
  }
  const totalWeight = data.reduce((sum, record) => sum + parseFloat(record.keydata), 0);

  return totalWeight / data.length;
};
