const fs = require('fs');
const mongoose = require('mongoose'), Schema = mongoose.Schema;
const Movie = require("../models/movie.js");

const CollectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    likes: { type: Number, required: true },
    views: { type: Number, required: true },
    type: { type: String, required: true },
    movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
});

const CollectionModel = mongoose.model('Collection', CollectionSchema);

class Collection {

    constructor(id, title, author, movies, type, likes, views) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.movies = movies;
        this.type = type;
        this.likes = likes;
        this.views = views;
    }

    static getAll() {
        return CollectionModel.find();
    }

    static getCollectionsCount(searchStr) {
        return CollectionModel.find({ title: { $regex: `(?i).*${searchStr}.*(?-i)` } }).countDocuments();
    };

    static getAll2(searchStr, skp, lm) {
        return CollectionModel.find({ title: { $regex: `(?i).*${searchStr}.*(?-i)` } }).skip(skp).limit(lm);
    };

    static getById(id) {
        return CollectionModel.findById(id).populate({
            path: 'movies',
            populate: { path: 'movies' }
          });
    }

    static insert(x) {
        return new CollectionModel(x).save();
    }

    static delete(id) {
        return CollectionModel.deleteOne({ _id: id });
    }

    static update(x) {
        return  CollectionModel.findOneAndUpdate(
              { _id: x.id },
              {
                  $set:
                  {
                      title: x.title,
                      type: x.type,
                      author: x.author,
                      likes: x.likes,
                      views: x.views
                  }
              },
              { returnOriginal: false });
      }

    static addMovie(id, movieId) {
        return CollectionModel.update(
            { "_id": id },
            {
                $addToSet:
                {
                    "movies": movieId,
                }
            });
    }
};

module.exports = Collection;