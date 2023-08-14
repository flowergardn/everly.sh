const scrape = async (regex: RegExp, url: string, matchIndex = 0) => {
  if (!url) {
    return {
      success: false,
      error: "Invalid body.",
    };
  }

  const ytResponse = await fetch(url).then(async (r) => await r.text());

  const output = ytResponse.replaceAll(
    /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,
    ""
  );

  const matches = regex.exec(output);

  if (matches === null) {
    return {
      success: false,
      error: "No matches.",
    };
  }

  return {
    success: true,
    match: matches[matchIndex],
  };
};

const getPfp = async (url: string) => {
  const scrapeResult = await scrape(
    /<meta property="og:image" content="(.*?)">/gi,
    url,
    1
  );
  return scrapeResult.match;
};

const getName = async (url: string) => {
  const scrapeResult = await scrape(
    /itemprop="name" content="([^"]+)"/g,
    url,
    1
  );
  return scrapeResult.match;
};

export { scrape, getPfp, getName };
