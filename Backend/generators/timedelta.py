import datetime

def end_date(start_date, duration):
    return start_date + datetime.timedelta(days=duration)