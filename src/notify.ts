import axios from "axios";

export const sendLineNotification = async (message: string) => {
  const url = "https://notify-api.line.me/api/notify";
  const token = process.env.LINE_NOTIFY_TOKEN;

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await axios.post(url, `message=${encodeURIComponent(message)}`, { headers });
    if (response.status !== 200) {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.log("Error sending LINE notification", error);
    throw error;
  }
};

/** 通知メッセージの整形 */
export const formatMessage = (currentWeekAverageWeight: number, weeklyWeightDiff: string) => {
  /** 通知メッセージ */
  const message = `\n今週の体重 ${currentWeekAverageWeight.toFixed(2)}kg(${weeklyWeightDiff}kg)`;

  return message;
};
