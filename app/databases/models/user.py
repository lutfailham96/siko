from app.databases.db_sql import db_sql
from flask_login import UserMixin
from app.utils.time_utils import datetime_jakarta
from app.managers import login_manager


class User(db_sql.Model, UserMixin):
    id = db_sql.Column(db_sql.Integer(), primary_key=True)
    fullname = db_sql.Column(db_sql.String(32), nullable=False)
    username = db_sql.Column(db_sql.String(32), nullable=False, unique=True)
    password = db_sql.Column(db_sql.String(95), nullable=False)
    created = db_sql.Column(db_sql.DateTime())
    updated = db_sql.Column(db_sql.DateTime())

    def add_timestamp(self):
        self.created = datetime_jakarta()
        self.updated = self.created

    def update_timestamp(self):
        self.updated = datetime_jakarta()

    @staticmethod
    def add(data):
        try:
            data.add_timestamp()
            # data.password = User.hash_password(data.password)
            db_sql.session.add(data)
            db_sql.session.commit()
            return True
        except Exception as e:
            print(e)
            db_sql.session.rollback()
            db_sql.session.flush()
            return False

    @staticmethod
    def update(data):
        try:
            data.update_timestamp()
            # data.password = User.hash_password(data.password)
            db_sql.session.commit()
            return True
        except Exception as e:
            print(e)
            db_sql.session.rollback()
            db_sql.session.flush()
            return False

    @staticmethod
    def delete(id_data):
        try:
            data = User.query.get(id_data)
            db_sql.session.delete(data)
            db_sql.session.commit()
            return True
        except Exception as e:
            print(e)
            db_sql.session.rollback()
            db_sql.session.flush()
            return False

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'fullname': self.fullname
        }

    # @staticmethod
    # def check_username(username):
    #     data = User.query.filter(User.username == username).first()
    #     if data is not None:
    #         return True
    #     return False
    #
    # @staticmethod
    # def hash_password(password):
    #     hash_password = generate_password_hash(password)
    #     return hash_password
    #
    # def check_password(self, password):
    #     return check_password_hash(self.password, password)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
