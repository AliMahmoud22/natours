
class apiFeatures {
  constructor(query, query_String) {
    this.query = query;
    this.query_String = query_String;
  }
  //filter
  filter() {
    const excludeFilter = ['page', 'sort', 'limit', 'fields'];
    const queryObj = { ...this.query_String };
    excludeFilter.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  //sorting
  sort() {
    if (this.query_String.sort) {
      const Sort = this.query_String.sort.split(',').join(' ');
      this.query = this.query.sort(Sort);
    } else {
      this.query = this.query.sort('createdAt');
    }
    return this;
  }
  //limitFields
  fields() {
    if (this.query_String.fields) {
      const fields = this.query_String.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  //pagination
  paginate() {
    const page = this.query_String.page * 1 || 1;
    const limit = this.query_String.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default apiFeatures;
