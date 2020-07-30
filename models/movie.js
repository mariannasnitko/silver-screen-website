const fs = require('fs');
const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    taglines: { type: String, required: true },
    director: { type: String, required: true },
    genre: { type: String, required: true },
    date: { type: Date, required: true },
    runtime: { type: Number, required: true },
    rating: { type: Number, required: true },
    posterUrl: { type: String, required: true }
});

const MovieModel = mongoose.model('Movie', MovieSchema);

class Movie {

    constructor(id, title, taglines, director, genre, date, runtime, rating, posterUrl) {
        this.id = id;
        this.title = title;
        this.taglines = taglines;
        this.director = director;
        this.genre = genre;
        this.date = date;
        this.runtime = runtime;
        this.rating = rating;
        this.posterUrl = posterUrl;
    }

    static getAll() {
        return MovieModel.find();
    }

    static getMoviesCount(searchStr) {
        return MovieModel.find({ title: { $regex: `(?i).*${searchStr}.*(?-i)` } }).countDocuments();
    };

    static getAll2(searchStr, skp, lm) {
        return MovieModel.find({ title: { $regex: `(?i).*${searchStr}.*(?-i)` } }).skip(skp).limit(lm);
    };

    static getById(id) {
        return MovieModel.findById(id);
    }

    static insert(x) {
        return new MovieModel(x).save();
    }

    static delete(id) {
        return MovieModel.deleteOne({ _id: id });
    }

    static update(x) {
        return MovieModel.findOneAndUpdate(
            { _id: x.id },
            {
                $set:
                {
                    title: x.title,
                    taglines: x.taglines,
                    director: x.director,
                    genre: x.genre,
                    date: x.date,
                    runtime: x.runtime,
                    rating: x.rating,
                    posterUrl: x.posterUrl
                }
            },
            { returnOriginal: false });
    }
};

module.exports = Movie;