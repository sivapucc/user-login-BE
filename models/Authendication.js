import jwt from "jsonwebtoken";

export const isAuthendicated = async (req, res, next) => {
  let token;
  console.log(req.headers);
  if (req.headers) {
    try {
      token = await req.headers["x-auth-token"];
      const decode = jwt.verify(token, process.env.SECRETKEY);
      req.user = decode.user;
      if (decode != true) {
        res.status(404).json({ message: "access denied" });
      }
      next();
    } catch (error) {
      console.log(error);
    }
  }
};
