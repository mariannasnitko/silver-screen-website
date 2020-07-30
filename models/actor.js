const fs = require('fs');
const mongoose = require('mongoose'), Schema = mongoose.Schema;
const Movie = require("../models/movie.js");

const ActorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    born: { type: Date, required: true },
    place: { type: String, required: true },
    movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }],
    sign: { type: String, required: true },
    fact: { type: String, required: true },
    years: { type: Number, required: true },
    photo: { type: String, required: true }
});

const ActorModel = mongoose.model('Actor', ActorSchema);

class Actor {

    constructor(id, name, born, place, movies, sign, fact, years, photo) {
        this.id = id;
        this.name = name;
        this.born = born;
        this.place = place;
        this.movies = movies;
        this.sign = sign;
        this.fact = fact;
        this.years = years;
        this.photo = photo;
    }

    static getAll() {
        return ActorModel.find();
    }

    static getActorsCount(searchStr) {
        return ActorModel.find({ name: { $regex: `(?i).*${searchStr}.*(?-i)` } }).countDocuments();
    };

    static getAll2(searchStr, skp, lm) {
        return ActorModel.find({ name: { $regex: `(?i).*${searchStr}.*(?-i)` } }).skip(skp).limit(lm);
    };

    static getById(id) {
        return ActorModel.findById(id);
    }

    static insert(x) {
        return new ActorModel(x).save();
    }

    static delete(id) {
        return ActorModel.deleteOne({ _id: id });
    }

    static update(x) {
      return  ActorModel.findOneAndUpdate(
            { _id: x.id },
            {
                $set:
                {
                    name: x.name,
                    born: x.born,
                    place: x.place,
                    sign: x.sign,
                    fact: x.fact,
                    years: x.years,
                    photo: x.photo
                }
            },
            { returnOriginal: false });
    }
};

module.exports = Actor;