import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { checkAuth } from './auth';
import cookieParser from 'cookie-parser';

const PORT = 3000;
const app = express();

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

let users: {email: string, password: string}[] = [];

try {
    const userData = fs.readFileSync("./data/users.json", "utf-8");
    users = JSON.parse(userData)
} catch {
    users = [];
}

app.post("/signup", (req: Request, res: Response) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).send("Email and password are required!")
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = {email, password: hash};
    users.push(newUser);

    fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));

    res.status(201).send("User registered successfully");
})

app.post("/signin", (req: Request, res: Response) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).send("Email and password are required!");
    }

    const user = users.find((user) => user.email === email);

    if (!user) {
        return res.status(401).send("User not found!")
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
        return res.status(401).send("Invalid Credentails");
    }

    // Create and send a JWT token upon successful authentication
    const token = jwt.sign({email}, "9TSakSPF4K89kSIyUjMF", {
        expiresIn: "1h",
    })
    res.cookie("token", token);

    res.redirect("/");
})

app.post("/logout", (req: Request, res: Response) => {
    res.clearCookie("token");
    res.redirect("/signin.html");
})
app.get("/data",checkAuth, (req: Request, res: Response) => {
   res.sendFile(__dirname+ "/data/appData.json");
})

app.get("/", checkAuth, (req: Request, res: Response) => {
    res.sendFile(__dirname + "/index.html");
})
app.listen(PORT, () => console.log(`Server is running on PORT at ${PORT}`));