from uuid import uuid4
from app.databases.db_sql import db_sql
from app.utils.time_utils import datetime_jakarta, date_jakarta_o


class Transaction(db_sql.Model):
    id = db_sql.Column(db_sql.Integer(), primary_key=True)
    transaction_code = db_sql.Column(db_sql.String(36), nullable=False)
    product_code = db_sql.Column(db_sql.String(10), nullable=False)
    product_price = db_sql.Column(db_sql.Integer(), nullable=False, default=0)
    product_stock_price = db_sql.Column(db_sql.Integer(), nullable=False, default=0)
    transaction_type = db_sql.Column(db_sql.Integer(), nullable=False)
    transaction_count = db_sql.Column(db_sql.Integer(), nullable=False)
    transaction_date = db_sql.Column(db_sql.Date(), nullable=False)
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
            item.transaction_code = str(uuid4())
            item.transaction_date = date_jakarta_o()
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
    def delete(transaction_code):
        try:
            item = Transaction.query.filter(Transaction.product_code == transaction_code).first()
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
            'transaction_code': self.transaction_code,
            'product_code': self.product_code,
            'transaction_type': self.transaction_type,
            'transaction_count': self.transaction_count,
            'transaction_date': str(self.transaction_date),
            'stock_price': self.product_stock_price,
            'product_price': self.product_price
        }
        return data

    def to_table(self, index, product_name):
        data = {
            'number': index + 1,
            'transaction_code': self.transaction_code,
            'product_code': self.product_code,
            'product_name': product_name,
            'product_price': self.product_price,
            'product_stock_price': self.product_stock_price,
            'transaction_type': self.transaction_type,
            'transaction_count': self.transaction_count,
            'transaction_date': str(self.transaction_date),
        }
        return data
