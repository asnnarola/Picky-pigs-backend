
const menus = require("../models/menus");
const async = require("async");
const menus_helper = {};

menus_helper.get_filtered_records = async (filter_object) => {
    let skip = filter_object.pageSize * filter_object.page;

    try {
        var aggre = [
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

        var filtered_data = await menus.aggregate(aggre)
        console.log('filtered_data => ',filtered_data);

        var searched_record_count = await menus.aggregate([
            {
                $match: filter_object.columnFilter
            }]);

console.log('searched_record_count => ',searched_record_count);

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


module.exports = menus_helper
