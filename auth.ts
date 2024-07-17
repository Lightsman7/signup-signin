import { NextFunction, Request, Response } from "express";
import  Jwt  from "jsonwebtoken";


export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).redirect("/signin.html");
    }

    Jwt.verify(token, "9TSakSPF4K89kSIyUjMF", (err: any) => {

        if (err) {
            return res.status(401).send("Unauthorized");
        }
        next();
        
    })

    
}