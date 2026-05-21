export const translateBatch = async (texts, lang = "hi") => {
  try {
    const response = await fetch("http://localhost:5000/translate-batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texts, lang }),
    });

    const data = await response.json();

    const map = new Map();

    data.results.forEach((item) => {
      map.set(item.original, item.translated);
    });

    return map;
  } catch (error) {
    console.error("Batch translation API error:", error);
    return new Map();
  }
};

export const translateText = async (text, lang = "hi") => {
  const map = await translateBatch([text], lang);
  return map.get(text) || text;
};