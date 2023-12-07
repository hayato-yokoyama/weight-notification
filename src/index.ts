import { parse, isWithinInterval, subDays } from "date-fns";
import dotenv from "dotenv";
dotenv.config();

import { fetchWeightData } from "./healthApi";
import { sendLineNotification } from "./lineNotify";

type WeightRecord = {
  date: string;
  keydata: string;
  model: string;
  tag: string;
};

type FetchData = {
  birth_date: string;
  data: WeightRecord[];
  height: string;
  sex: string;
};

// exports.handler = async () => {
//   try {
//     /** 2週間分(1~14日前)の体重 */
//     const data: FetchData = await fetchWeightData();

//     /** 今週分(1~7日前)の体重と先週分(8~14日前)の体重を分けて取得 */
//     const { currentWeekWeight, prevWeekWeight } =
//       separateCurrentAndPrevWeekWeights(data.data);

//     /** 今週分(1~7日前)の体重の平均 */
//     const currentWeekAverageWeight = calculateAverageWeight(currentWeekWeight);
//     /** 先週分(8~14日前)の体重の平均 */
//     const prevWeekAverageWeight = calculateAverageWeight(prevWeekWeight);

//     /** 体重の増減 */
//     const weeklyWeightDiff = () => {
//       const result = currentWeekAverageWeight - prevWeekAverageWeight;
//       if (result > 0) {
//         return `+${result}`;
//       }
//       return `${result.toFixed(2)}`;
//     };
//     /** 通知メッセージ */
//     const message = `今週の平均体重: ${currentWeekAverageWeight.toFixed(
//       2
//     )} kg (${weeklyWeightDiff()}kg)`;

//     console.log(message);

//     // LINE通知
//     // await sendLineNotification(message);
//   } catch (error) {
//     console.error("Lambda function error", error);
//     // 必要に応じてエラー処理
//   }
// };

const formatMessage = async () => {
  try {
    /** 2週間分(1~14日前)の体重 */
    const data: FetchData = await fetchWeightData();

    /** 今週分(1~7日前)の体重と先週分(8~14日前)の体重を分けて取得 */
    const { currentWeekWeight, prevWeekWeight } =
      separateCurrentAndPrevWeekWeights(data.data);

    /** 今週分(1~7日前)の体重の平均 */
    const currentWeekAverageWeight = calculateAverageWeight(currentWeekWeight);
    /** 先週分(8~14日前)の体重の平均 */
    const prevWeekAverageWeight = calculateAverageWeight(prevWeekWeight);

    /** 体重の増減 */
    const weeklyWeightDiff = () => {
      const result = currentWeekAverageWeight - prevWeekAverageWeight;
      if (result > 0) {
        return `+${result}`;
      }
      return `${result.toFixed(2)}`;
    };
    /** 通知メッセージ */
    const message = `今週の平均体重: ${currentWeekAverageWeight.toFixed(
      2
    )} kg (${weeklyWeightDiff()}kg)`;

    // LINE通知
    await sendLineNotification(message);
  } catch (error) {
    console.error("Lambda function error", error);
    // 必要に応じてエラー処理
  }
};

formatMessage();

// 取得した体重データから今週分の体重と先週分の体重を分ける
const separateCurrentAndPrevWeekWeights = (data: WeightRecord[]) => {
  /** 1週間前の日付 */
  const oneWeekAgo = subDays(new Date(), 7);

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

const parseDate = (dateStr: string): Date => {
  // 'yyyyMMddHHmm' 形式の文字列をDateオブジェクトに変換
  return parse(dateStr, "yyyyMMddHHmm", new Date());
};

const calculateAverageWeight = (data: WeightRecord[]) => {
  if (data.length === 0) {
    return 0;
  }

  const totalWeight = data.reduce(
    (sum, record) => sum + parseFloat(record.keydata),
    0
  );
  return totalWeight / data.length;
};
