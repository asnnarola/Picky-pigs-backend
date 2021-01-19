const constant = require("../config/constants");
const config = require("../config/config");
const fs = require("fs");
const async = require("async");
const jwt = require('jsonwebtoken');
const common_helper = {};
const makeDir = require('make-dir');
const { v4: uuidv4 } = require('uuid');
const { Client } = require("@googlemaps/google-maps-services-js");


common_helper.getDistance = async (lat1, lng1, lat2, lng2) => {
  return new Promise((resolve, reject) => {
    try {
      const client = new Client({});

      client.distancematrix({
        params: {
          origins: [{ lat: lat1, lng: lng1 }],
          destinations: [{ lat: lat2, lng: lng2 }],
          key: config.GOOGLE_MAP_API_KEY,
        },
        timeout: 1000, // milliseconds
      })
        .then((distancematrix_resp) => {
          /**distancematrix_resp.data.rows[0].elements[0].distance.value in metered */
          resolve(distancematrix_resp.data.rows[0].elements[0].distance)
        })
        .catch((error) => {
          console.log(error);
          reject(error)
        });
    } catch (error) {
      console.log(error)
      reject(error)
    }
  });
}


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
    console.log('error => ', error);
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
    console.log('error => ', error);
    return { status: 0, message: "No data updated", error: error.message };
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
    return { status: 0, message: "No data deleted", error: error.message };
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
    return { status: 0, message: "No data deleted", error: error.message };
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
    return { status: 0, message: "No data found", error: error.message };
  }
};

/*
 * update data with upsert
 * 
 * @param   collection      String      collection of model that need to be update
 * @param   id              String      _id of data  that need to update
 * @param   object          JSON        object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in update data, with error
 *          status  1 - If update data, with appropriate message
 *          status  2 - If no data update, with appropriate message
 * 
 */
common_helper.updatewithupsert = async (collection, id, data) => {
  try {
    var data2 = await collection.findOneAndUpdate(id, data, { new: true, upsert: true })
    if (data2) {
      return {
        status: 1,
        message: "Record updated successfully.",
        data: data2
      };
    } else {
      return { status: 2, message: "No data updated" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occurred while updating data",
      error: err
    };
  }
}


common_helper.addOrUpdate = async (collection, condition, dataObject) => {
  try {
    if (dataObject._id === undefined) {

      /**Insert for the new doc */
      let document = new collection(dataObject);
      let data = await document.save();
      return { status: 1, message: "Data inserted", data };
    } else {

      /**update for old doc */
      let data = await collection.findOneAndUpdate(condition, dataObject, { new: true }).lean();
      return { status: 1, message: "Data updated", data };
    }
  } catch (err) {
    console.log("-----", err)
    return {
      status: 0,
      message: "Error occurred while updating data",
      error: err
    };
  }
}


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
      reject({ status: 0, message: "No file(s) selected", error: error.message });
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


/** Pagination of the array */
common_helper.pagination = async function (modified_arry, startPage, lengthPage) {
  try {
    // let modified_arry = modified_arry || [];
    let per_page = lengthPage || 10;
    let start = startPage || 0;
    let paginationArray = [];
    let loopCounter = (start + per_page);

    for (let i = start; i < loopCounter; i++) {
      let element = modified_arry[i] ? modified_arry[i] : null;

      if (element) {
        paginationArray.push(element);
      }
    }

    return responseData = {
      data: paginationArray,
      recordsTotal: modified_arry.length,
      // filteredrecords: paginationArray.length
    };
  } catch (error) {
    return {
      status: 0,
      message: "Error occurred while pagination data",
      error: error
    };
  }
};

common_helper.clone = async (model, DataObject) => {
  try {
    let dishCloneDetail = JSON.parse(JSON.stringify(DataObject));
    delete dishCloneDetail._id;
    let create_schema_document = new model(dishCloneDetail);
    let data = await create_schema_document.save();
    return { status: 1, message: "Data clone", data };
  } catch (error) {
    return { status: 0, message: "No data clone", error: error.message };
  }
};

module.exports = common_helper;
