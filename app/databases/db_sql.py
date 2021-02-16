from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db_sql = SQLAlchemy()
db_migrate = Migrate(db=db_sql)
