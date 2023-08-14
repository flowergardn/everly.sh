import { NextApiRequest, NextApiResponse } from "next";

const purchase = (req: NextApiRequest, res: NextApiResponse) => {
  res.redirect(`https://everly.sellpass.io/products/Everly`);
};

export default purchase;
