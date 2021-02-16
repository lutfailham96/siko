from datetime import datetime
import pytz


def datetime_jakarta():
    utc_now = datetime.utcnow()
    tz = pytz.timezone("Asia/Jakarta")
    datetime_now = utc_now.replace(tzinfo=pytz.utc).astimezone(tz)
    return datetime_now


def date_jakarta():
    return datetime.today().strftime('%Y-%m-%d')


def date_jakarta_o():
    return datetime.today()


def timestamp_jakarta(rounded=True):
    if rounded:
        return round(datetime.timestamp(datetime_jakarta()))
    return datetime.timestamp(datetime_jakarta())


def datetime_from_timestamp(timestamp, rounded=True):
    if rounded:
        utc_now = datetime.fromtimestamp(round(timestamp))
    else:
        utc_now = datetime.fromtimestamp(timestamp)
    tz = pytz.timezone("Asia/Jakarta")
    datetime_now = utc_now.replace(tzinfo=pytz.utc).astimezone(tz)
    return datetime_now


def timestamp_from_datetime(date_time, rounded=True):
    if rounded:
        return round(datetime.timestamp(date_time))
    return datetime.timestamp(date_time)
