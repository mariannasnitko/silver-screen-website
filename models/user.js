const mongoose = require('mongoose');
const crypto = require('crypto-js');
const secretString = "%1.1_51llus10N%";

const UserSchema = new mongoose.Schema({
    login: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: Number, default: 0 },
    fullname: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now() },
    avaUrl: { type: String, required: true },
    isDisabled: { type: Boolean, default: false },
    chatId: { type: String, default: '' }
});

const UserModel = mongoose.model('User', UserSchema);

UserSchema.methods.generateHash = function (password) {
    return crypto.SHA512(password + secretString).toString();
};

UserSchema.methods.validPassword = (user, password) => {
    console.log(user.password === UserModel.schema.methods.generateHash(password));
    return user.password === UserModel.schema.methods.generateHash(password);
};

UserSchema.methods.getAll = () => {
    return UserModel.find();
};

UserSchema.methods.getUsersCount = (searchStr) => {
    return UserModel.find({ login: { $regex: `(?i).*${searchStr}.*(?-i)` } }).countDocuments();
};

UserSchema.methods.getAll2 = (searchStr, skp, lm) => {
    return UserModel.find({ login: { $regex: `(?i).*${searchStr}.*(?-i)` } }).skip(skp).limit(lm);
};

UserSchema.methods.getById = (id) => {
    return UserModel.findById(id);
};

UserSchema.methods.insert = (x) => {
    return new UserModel(x).save();
};

UserSchema.methods.update = (x) => {
    return UserModel.findOneAndUpdate(
        { _id: x.id },
        {
            $set:
            {
                role: x.role
            }
        },
        { returnOriginal: false });
};

UserSchema.methods.updateX = (id, us) => {
    return UserModel.findByIdAndUpdate(id, us, { new: true, useFindAndModify: false });
};

UserSchema.methods.updateAll = (x) => {
    return UserModel.findOneAndUpdate(
        { _id: x.id },
        {
            $set:
            {
                role: x.role,
                login: x.login,
                fullname: x.fullname,
                avaUrl: x.avaUrl,
                isDisabled: x.isDisabled
            }
        },
        { returnOriginal: false });
};

UserSchema.methods.delete = (id) => {
    return UserModel.deleteOne({ _id: id });
};

UserSchema.methods.getByLogin = (login) => {
    return UserModel.findOne({ login: login });
};

module.exports = UserModel;