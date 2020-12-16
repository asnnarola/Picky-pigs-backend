const constant = require("../constants");
const config = require("../config");
const fs = require("fs");
const async = require("async");
const jwt = require('jsonwebtoken');
const common_helper = {};
const makeDir = require('make-dir');
const { v4: uuidv4 } = require('uuid');

/**
 * sign will get encode your plain Object into cipherText
 * @param {*} plainObject plain Object
 * @return {*} new generated cipher text
 */
common_helper.sign = async (plainObject) => {
  try {
    var data = await jwt.sign(plainObject, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })
    return data;
  } catch (error) {
    return error;
  }
};

/**
 * count will get count number of document in collection
 * @param {Collection Object} model name of collection
 * @param {Object} condition condition of fetch record
 * @return {Object} responseObject with status,message and data(no. of record count)
 */
common_helper.count = async (model, condition = {}) => {
  try {
    let data = await model.countDocuments(condition);
    return { status: 1, message: "Data found", data };
  } catch (error) {
    return { status: 0, message: "No data found", error: error.message };
  }
};

/**
 * insert new record in collection
 * @param {Collection Object} model name of collection
 * @param {Object} newData object of new record
 * @return {Object} responseObject with status,message and data(new inserted record object)
 */
common_helper.insert = async (Model, newData) => {
  try {
    let document = new Model(newData);
    let data = await document.save();
    return { status: 1, message: "Data inserted", data };
  } catch (error) {
    console.log('error => ',error);
    return { status: 0, message: "No data inserted", error: error.message };
  }
};

/**
 * insert Many records in collection
 * @param {Collection Object} model name of collection
 * @param {Array} newData array of new records objects
 * @return {Object} responseObject with status,message and data(new inserted records count)
 */
common_helper.insertMany = async (Model, newData) => {
  try {
    let data = await Model.insertMany(newData);
    return { status: 1, message: "Data inserted", data };
  } catch (error) {
    return { status: 0, message: "No data inserted" };
  }
};

/**
 * update existing record in collection
 * @param {Collection Object} model name of collection
 * @param {Object} condition condition of which record to be update
 * @param {Array} newData object of record to be replace with old record
 * @return {Object} responseObject with status,message and data(updated record object)
 */
common_helper.update = async (model, condition, newData) => {
  try {
    let data = await model.findOneAndUpdate(condition, newData, { new: true }).lean();
    return { status: 1, message: "Data updated", data };
  } catch (error) {
    console.log('error => ',error);
    return { status: 0, message: "No data updated", error: error.message};
  }
};

/**
 * soft delete record in collection(set flag isDeleted: 1)
 * @param {Collection Object} model name of collection
 * @param {Object} condition condition of which record to be delete
 * @return {Object} responseObject with status,message and data(deleted record object)
 */
common_helper.softDelete = async (model, condition) => {
  try {
    let data = await model.findOneAndUpdate(condition, { isDeleted: 1 }, { new: true });
    return { status: 1, message: "Data deleted", data };
  } catch (error) {
    return { status: 0, message: "No data deleted", error: error.message};
  }
};


/**
 * delete record in collection
 * @param {Collection Object} model name of collection
 * @param {Object} condition condition of which record to be delete
 * @return {Object} responseObject with status,message and data(deleted record object)
 */
common_helper.delete = async (model, condition) => {
  try {
    let data = await model.findOneAndDelete(condition);
    return { status: 1, message: "Data deleted", data };
  } catch (error) {
    return { status: 0, message: "No data deleted", error: error.message};
  }
};


/**
 * find records in collection
 * @param {Collection Object} model name of collection
 * @param {Object} condition condition of which record to be find
 * @return {Object} responseObject with status,message and data(fetched records array)
 */
common_helper.find = async (model, condition = {}) => {
  try {
    let data = await model.find(condition).lean();
    return { status: 1, message: "Data found", data };
  } catch (error) {
    return { status: 0, message: "No data found", error: error.message };
  }
};


/**
 * find one records in collection
 * @param {Collection Object} model name of collection
 * @param {Object} condition condition of which record to be find
 * @return {Object} responseObject with status,message and data(fetched single record)
 */
common_helper.findOne = async (model, condition = {}) => {
  try {
    let data = await model.findOne(condition).lean();
    return { status: 1, message: "Data found", data };
  } catch (error) {
    return { status: 0, message: "No data found", error: error.message};
  }
};


/**
 * find records in collection
 * @param {Files} files data of file or files
 * @param {String} dir path of directory where to upload data
 * @param {String} name name of file to be generate for newly uploaded file.
 * @return {Object} responseObject with status,message and data(array of all uploaded files path)
 */
// let samplePromise = await common_helper.upload(req.files['filename'], "folder_name", "file_pre_name");
// let samplePromise = await common_helper.upload(req.files['filename'], "folder_name", "file_pre_name");
common_helper.upload = async (files, dir, mimetype = "image") => {

  var promise = new Promise(async function (resolve, reject) {
    var file_path_list = [];
    try {
      let _files = [].concat(files);


      if (_files.length > 0) {
        await makeDir(dir);
        async.eachSeries(_files, async (file, next) => {
          if (constant.MIME_TYPES[mimetype].indexOf(file.mimetype) >= 0) {

            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir);
            }
            var filename = "";
            try {

              filename =
                 new Date().getTime() + uuidv4() + "." + file.name.split(".").pop();

            } catch (error) {
              filename = new Date().getTime() + uuidv4() + "." + file.name.split(".").pop();
            }
            location = dir + "/" + filename

            file_path_list.push({
              name: file.name,
              path: location
            });

            file.mv(dir + "/" + filename, err => {
            });
          } else {

            next();
          }
        }, function () {
          resolve({ status: 1, message: `file(s) uploaded`, data: file_path_list });
        });
      } else {
        reject({ status: 0, message: "No file(s) selected" });
      }
    } catch (error) {
      reject({ status: 0, message: "No file(s) selected", error: error.message});
    }
  });
  return promise;
};

common_helper.changeObject = function (data, callback) {

  let columnFilter = {};
  let columnSort = {};
  let filter = [];

  async.forEach(data.columnFilter, function (val, next) {
    var key = val.id;
    var value = val.value;
    if (val.isDigitFlag) {
      value = parseInt(val.value);
    } else if (!val.isEqualFlag) {
      let re = new RegExp(val.value, "i");
      value = {
        $regex: re
      };
    }
    columnFilter[key] = value;
  });

  if (data.columnSort && data.columnSort.length > 0) {
    async.forEach(data.columnSort, function (val, next) {
      var key = val.id;
      var value = 1;
      if (val.desc) {
        value = -1;
      }
      columnSort[key] = value;
    });
  } else {
    columnSort["_id"] = -1;
  }

  data = {
    pageSize: data.pageSize,
    page: data.page,
    columnSort,
    columnFilter
  };

  return data;
};

module.exports = common_helper;
