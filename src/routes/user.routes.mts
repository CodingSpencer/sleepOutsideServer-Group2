import { Router } from "express";
import userService from "../services/user.service.mts";
import { sanitize } from "../services/utils.mts";
import authorize from "../middleware/authorize.mts";

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

router.post("/", async (req,res,next) => {
    try {
      const cleanBody = sanitize(req.body)
    const {email, name, password} = cleanBody;

    const newUser = await userService.register(email, password, name)
    res.status(200).json({message:"User created successfully", userId: newUser.insertedId});
    } catch(err) {
        next(err);
    }

})

// Protect a route with JWT authentication. Note the authorize middleware! Make sure to import it as well.
router.get('/protected', authorize, (req, res) => {
  console.log(res.locals.user);
  res.json({ message: `Hello, ${res.locals.user.email}!` });
});

export default router;