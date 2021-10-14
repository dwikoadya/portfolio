const AppError = require("./appError");
const asyncHandler = require("./asyncHandler");

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

exports.getAll = (Model) =>
  asyncHandler(async (res) => {
    const doc = await Model.find();

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError(`No documents found with that ID!`, 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidator: true,
    });
    if (!doc) {
      return next(new AppError(`No documents found with that ID!`, 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`No documents found with that ID!`, 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
