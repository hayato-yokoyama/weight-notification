import dotenv from "dotenv";
dotenv.config();

import { calcWeightAverageDiff, fetchWeight } from "./fetchWeight";
import { formatMessage, sendLineNotification } from "./notify";

export type WeightRecord = {
  date: string;
  keydata: string;
  model: string;
  tag: string;
};

export type FetchData = {
  birth_date: string;
  data: WeightRecord[];
  height: string;
  sex: string;
};

const job = async () => {
  /** 2週間分(1~14日前)の体重 */
  const fetchData: FetchData = await fetchWeight();

  /** 今週分(1~7日前)の体重の平均と先週分との体重の増減 */
  const { currentWeekAverageWeight, weeklyWeightDiff } =
    calcWeightAverageDiff(fetchData);

  /** 通知メッセージ */
  const notificationMessage = formatMessage(
    currentWeekAverageWeight,
    weeklyWeightDiff
  );

  // LINE通知
  await sendLineNotification(notificationMessage);
};

job();
