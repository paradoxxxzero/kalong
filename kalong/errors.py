class KalongException(Exception):
    pass


class NoClientFoundError(KalongException):
    pass


class NoServerFoundError(KalongException):
    pass


class CantStartServerError(KalongException):
    pass
