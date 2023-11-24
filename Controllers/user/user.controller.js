const { object } = require("joi");
const { db } = require("../../Config/db");

const { generateAccessToken, setAccessTokenCookie } = require("../../Utils/auth.utils");
const { login_validation, forgot_password_validation } = require("./validation")

const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const nodemailer = require('nodemailer');
const path = require('path');

const mailerhbs = require('nodemailer-express-handlebars');


const userLogin = async (req, res) => {

    try {

        await login_validation.validateAsync(req.body, { abortEarly: false });
        const user = {
            "id": 1,
            "user_type_id": 11,
            "first_name": "Baliram",
            "last_name": "Giri",
            "first_time_login": 0,
        }
        const token = generateAccessToken({ user_type_id: 1, id: 1 })

        delete user.password;
        res.writeHead(200, {
            "Set-Cookie": `token=${"sfhdgf"}; HttpOnly; Secure; SameSite=None; Partitioned`,
            "Access-Control-Allow-Credentials": "true",
            "Content-Type": "application/json",
        });
        res.end(JSON.stringify(user));
        // const [[user]] = await db.query(`SELECT id, user_type_id, first_name, last_name, first_time_login, profile_pic, password FROM users WHERE email='${req.body.email}'`)

        // if (!user) {

        //     return res.status(401).json({ message: "Email or Password incorrect" })

        // } else {

        //     const hasPassCheck = await bcrypt.compare(req.body.password, user.password)

        //     if (!hasPassCheck) {

        //         return res.status(402).json({ message: "Email or Password incorrect" })

        //     } else {
        //         const token = generateAccessToken({ user_type_id: 1, id: 1 })
        //         setAccessTokenCookie(res, token);
        //         delete user.password;
        //         res.status(200).json(user)


        //     }
        // }

    } catch (error) {

        res.status(400).json({ message: error.message })

    }
}


const userDetails = async (req, res) => {

    try {

        const user_query = `SELECT users.email as email, users.first_name as first_name,
        users.middle_name as middle_name, users.last_name as last_name, users.profile_pic
        FROM users
        WHERE users.id=?`;

        const [[user_results]] = await db.query(user_query, [res.userId]);

        if (!user_results) {
            res.status(404).json({ message: "User detail not found" })
        }

        res.status(200).json({ data: { ...user_results, profile_pic: user_results.profile_pic ? new Buffer.from(user_results.profile_pic, 'binary').toString('base64') : "" }, access_token: res.access_token })

    } catch (error) {

        res.status(400).json({ message: error.message })
    }

}


const updateAccountInfo = async (req, res) => {

    try {

        if (!Object.keys(req.body).length) {

            res.status(400).json({ message: "Atleast one field should be there to update" })
        }

        let password;

        if (req.body?.password) {
            password = bcrypt.hashSync(req.body?.password, 10);
        }

        const sql = 'UPDATE users SET ? WHERE id = ?';
        await db.query(sql, [password ? { ...req.body, password } : req.body, res.userId])

        res.status(200).send({
            status_code: 200,
            message: "User detail updated successfully",
        });

    } catch (error) {

        res.status(400).json({ message: error.message })
    }
}


const forgotPassword = async (req, res) => {

    var user_email = req.body.email;

    try {

        if (!user_email) {

            res.status(400).json({ message: "Please enter your registered email id" })
        }

        const user_query = `SELECT id,email,first_name FROM users WHERE email=? AND is_active = 1`;

        const [[user_results]] = await db.query(user_query, [user_email]);

        if (!user_results) {

            res.status(400).json({ message: "Email does not exist" })
        }

        const token = jwt.sign({ id: user_results?.id.toString() }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30m" });

        const transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const handlebarOptions = {
            viewEngine: {
                extName: ".html",
                partialsDir: path.resolve('./Views/email'),
                defaultLayout: false,
            },
            viewPath: path.resolve('./Views/email'),
            extName: ".html",
        };

        transport.use('compile', mailerhbs(handlebarOptions));

        transport.sendMail({
            to: user_email,
            subject: 'Reset Password',
            from: process.env.FROM_EMAIL,
            template: 'forgot_password',
            context: { token: token, user_name: user_results?.first_name },

        }, (err) => {
            if (err) {
                res.status(400).json({
                    message: "Cannot send forgot password email",
                    error: err
                })
            }
            res.status(200).json({
                message: "Reset password link sent successfully",
                token: token,
                user_id: user_results?.id,
            })
        })

    } catch (error) {

        res.status(400).json({ message: error.message })
    }
}


const resetPassword = async (req, res) => {

    try {

        await forgot_password_validation.validateAsync(req.body, { abortEarly: false });

        const idToken = req.body.token;
        const decoded = jwt.verify(idToken, process.env.ACCESS_TOKEN_SECRET);

        const [[user]] = await db.query(`SELECT id FROM users WHERE id=${decoded.id}`)

        if (!user) {

            res.status(401).json({ message: "User details not found" })

        } else {

            const hash = bcrypt.hashSync(req.body.password, 10);

            const sql = 'UPDATE users SET ? WHERE id = ?';
            await db.query(sql, [{ password: hash }, decoded.id])

            res.status(200).send({
                status_code: 200,
                message: "User password updated successfully",
            });
        }

    } catch (error) {

        res.status(401).json({ message: error.message })
    }
}


module.exports = {

    userLogin,
    userDetails,
    updateAccountInfo,
    forgotPassword,
    resetPassword,
}
