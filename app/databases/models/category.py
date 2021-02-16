from app.databases.db_sql import db_sql
from app.utils.time_utils import datetime_jakarta


class Category(db_sql.Model):
    id = db_sql.Column(db_sql.Integer(), primary_key=True)
    category_code = db_sql.Column(db_sql.String(10), nullable=False, unique=True)
    category_name = db_sql.Column(db_sql.String(32), nullable=False)
    created = db_sql.Column(db_sql.DateTime())
    updated = db_sql.Column(db_sql.DateTime())

    def add_timestamp(self):
        self.created = datetime_jakarta()
        self.updated = self.created

    def update_timestamp(self):
        self.updated = datetime_jakarta()

    @staticmethod
    def add(item):
        try:
            item.add_timestamp()
            db_sql.session.add(item)
            db_sql.session.commit()
            return True
        except Exception as e:
            print(e)
            db_sql.session.rollback()
            db_sql.session.flush()
            return False

    @staticmethod
    def update(item):
        try:
            item.update_timestamp()
            db_sql.session.commit()
            return True
        except Exception as e:
            print(e)
            db_sql.session.rollback()
            db_sql.session.flush()
            return False

    @staticmethod
    def delete(category_code):
        try:
            item = Category.query.filter(Category.category_code == category_code).first()
            db_sql.session.delete(item)
            db_sql.session.commit()
            return True
        except Exception as e:
            print(e)
            db_sql.session.rollback()
            db_sql.session.flush()
            return False

    def to_dict(self):
        data = {
            'id': self.id,
            'category_code': self.category_code,
            'category_name': self.category_name
        }
        return data

    def to_table(self, index, product_total):
        data = {
            'number': index + 1,
            'category_code': self.category_code,
            'category_name': self.category_name,
            'product_total': product_total
        }
        return data

    def to_list(self):
        data = [
            self.category_code,
            self.category_name
        ]
        return data
