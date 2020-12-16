const constant = require("../constants");
const ingredient = require("../models/ingredient");
const config = require("../config");
const fs = require("fs");
const async = require("async");
const jwt = require('jsonwebtoken');
const { log } = require("debug");
const ingredient_helper = {};

ingredient_helper.get_filtered_records = async (filter_object) => {
	let skip = filter_object.pageSize * filter_object.page;

	try {
		var aggre = [
			{
				$lookup:
				{
					from: 'supplier',
					localField: 'supplier',
					foreignField: '_id',
					as: 'supplier'
				}
			},
			{
				$unwind: "$supplier"
			},
			{
				$lookup:
				{
					from: 'masterGroup',
					localField: 'masterGroup',
					foreignField: '_id',
					as: 'masterGroup'
				}
			},
			{
				$unwind: "$masterGroup"
			},
			{
				$match: filter_object.columnFilter
			},
			{
				$sort: filter_object.columnSort
			},
			{
				$skip: skip
			},
			{
				$limit: filter_object.pageSize
			},
		]

		var filtered_data = await ingredient.aggregate(aggre)

		var searched_record_count = await ingredient.aggregate([
			{
				$lookup:
				{
					from: 'supplier',
					localField: 'supplier',
					foreignField: '_id',
					as: 'supplier'
				}
			},
			{
				$unwind: "$supplier"
			},
			{
				$lookup:
				{
					from: 'masterGroup',
					localField: 'masterGroup',
					foreignField: '_id',
					as: 'masterGroup'
				}
			},
			{
				$unwind: "$masterGroup"
			},
			{
				$sort: { name: 1 }
			},
			{
				$match: filter_object.columnFilter
			}]);


		if (filtered_data.length > 0) {
			return {
				status: 1,
				message: "filtered data is found",
				count: searched_record_count.length,
				filtered_total_pages: Math.ceil(
					searched_record_count.length / filter_object.pageSize
				),
				filtered_ingredient: filtered_data
			};
		} else {
			return {
				status: 2,
				message: "No filtered data available",
				filtered_ingredient: filtered_data
			};
		}
	} catch (err) {
		return {
			status: 0,
			message: "Error occured while filtering data",
			error: err
		};
	}
};


module.exports = ingredient_helper
