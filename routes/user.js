const auth = require('../middleware/auth');
const { validate, User } = require('../models/user');
const response = require('../response_model/response');
const express = require('express');
const router = express.Router();
const _ = require('lodash')
const bcrypt = require('bcryptjs');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

router.post('/register', async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) {
            let result = response.unProcessable(error.details[0].message);
            return res.status(result.code).send(result);
        }

        let data = req.body;
        let user = await User.findOne({ email: data.email })
        if (user) {
            let result = response.unProcessable('User already register.');
            return res.status(result.code).send(result);
        }

        user = new User({ name: data.name, email: data.email, password: data.password, createdAt: new Date() });
        user.password = await user.generateHash(user.password);
        await user.save();
        const token = await user.generateAuthToken(user);
        res.header('authorization', token);
        let result = response.success("Registration success", user);
        return res.status(result.code).send(result);
    }
    catch (ex) {
        let result = response.fail(ex.message);
        return res.status(result.code).send(result);
    }
})

router.post('/login', async (req, res) => {
    try {
        const { error } = validateReq(req.body);
        if (error) {
            let result = response.unProcessable(error.details[0].message);
            return res.status(result.code).send(result);
        }

        let data = req.body;
        let user = await User.findOne({ email: data.email })
        if (!user) {
            let result = response.unProcessable('Invalid email or password.');
            return res.status(result.code).send(result);
        }

        const validatePassword = await bcrypt.compare(data.password, user.password);
        if (!validatePassword) {
            let result = response.unProcessable('Invalid email or password.');
            return res.status(result.code).send(result);
        }

        const token = await user.generateAuthToken(user);
        res.header('authorization', token);
        let result = response.success("login success", user);
        return res.status(result.code).send(result);
    }
    catch (ex) {
        let result = response.fail(ex.message);
        return res.status(result.code).send(result);
    }
})

router.post('/update-password', auth, async (req, res) => {
    try {

        let user = await User.findOne({ _id: req.user._id })
        if (!user) {
            let result = response.unProcessable('Account not found');
            return res.status(result.code).send(result);
        }

        let data = req.body;
        if (!bcrypt.compareSync(data.currentpassword, user.password)) {
            let result = response.unProcessable('Incorrect current password');
            return res.status(result.code).send(result);
        }
        user.password = await user.generateHash(data.newpassword);

        let updateUser = await User.findOneAndUpdate({ _id: req.user._id }, { $set: { password: user.password } }, { new: true })
        let result = response.success("Password updated", updateUser);
        return res.status(result.code).send(result);
    }
    catch (ex) {
        let result = response.fail(ex.message);
        return res.status(result.code).send(result);
    }
})

function validateReq(req) {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
    })
    return schema.validate(req);
}

module.exports = router;