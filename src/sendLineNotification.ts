export const sendLineNotification = async (message: string) => {
  const url = "https://notify-api.line.me/api/notify";
  const token = process.env.LINE_NOTIFY_TOKEN;

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: `message=${encodeURIComponent(message)}`,
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.log("Error sending LINE notification", error);
    throw error;
  }
};

/** 通知メッセージの整形 */
export const formatMessage = (
  currentWeekAverageWeight: number,
  weeklyWeightDiff: string
) => {
  /** 通知メッセージ */
  const message = `今週の平均体重: ${currentWeekAverageWeight.toFixed(
    2
  )} kg (${weeklyWeightDiff}kg)`;
  return message;
};
