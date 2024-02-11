import type { NextApiRequest, NextApiResponse } from "next";

const test = (req: NextApiRequest, res: NextApiResponse) => {
  res.json({
    lol: "yeah",
  });
};

export default test;
