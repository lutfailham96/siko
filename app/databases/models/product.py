from app.databases.db_sql import db_sql
from app.utils.time_utils import datetime_jakarta


class Product(db_sql.Model):
    id = db_sql.Column(db_sql.Integer(), primary_key=True)
    product_code = db_sql.Column(db_sql.String(10), nullable=False, unique=True)
    product_name = db_sql.Column(db_sql.String(32), nullable=False)
    product_stock_price = db_sql.Column(db_sql.Integer(), nullable=False)
    product_price = db_sql.Column(db_sql.Integer(), nullable=False)
    product_stock = db_sql.Column(db_sql.Integer(), nullable=False)
    category_code = db_sql.Column(db_sql.String(10), nullable=False)
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
    def delete(product_code):
        try:
            item = Product.query.filter(Product.product_code == product_code).first()
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
            'product_code': self.product_code,
            'product_name': self.product_name,
            'product_price': self.product_price,
            'product_stock_price': self.product_stock_price,
            'product_stock': self.product_stock,
            'category_code': self.category_code
        }
        return data

    def to_table(self, index, category_name):
        data = {
            'number': index + 1,
            'product_code': self.product_code,
            'product_name': self.product_name,
            'product_price': self.product_price,
            'product_stock_price': self.product_stock_price,
            'product_stock': self.product_stock,
            'category_code': self.category_code,
            'category_name': category_name
        }
        return data

    def to_list(self):
        data = [
            self.category_code,
            self.category_name
        ]
        return data
