import { Router } from "express";
import userService from "../services/user.service.mts";
import { sanitize } from "../services/utils.mts";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    // get the email and password from the body of the request
    const { email, password } = sanitize(req.body);

    // Forward a 401 error if either is null
    if (!email || !password) {
      throw Object.assign(new Error('Invalid email or password'), { status: 401 });
    }

    // sanitize them


    // call the service function
    const { user, token } = await userService.login(email, password);

    // forward a 401 error if either is null
    if (!user || !token) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // send back the token and user info
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;