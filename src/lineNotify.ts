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
