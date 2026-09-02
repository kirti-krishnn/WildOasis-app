import type { Query } from 'mongoose';

type QueryString = Record<string, unknown>;

export default class APIFeatures<T> {
  query: Query<T[], T>;
  queryString: QueryString;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = String(this.queryString.sort).split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = String(this.queryString.fields).split(',').join(' ');
      this.query = this.query.select(fields);
    }

    return this;
  }

  paginate() {
    const page = Math.max(1, parseInt(String(this.queryString.page), 10) || 1);
    const limit = Math.max(1, parseInt(String(this.queryString.limit), 10) || 100);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
