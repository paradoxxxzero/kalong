class KalongException(Exception):
    pass


class NoClientFoundError(KalongException):
    pass


class NoServerFoundError(KalongException):
    pass


class CantStartServerError(KalongException):
    pass


class SetFrameError(KalongException):
    def __init__(self, frame, event, arg):
        self.frame = frame
        self.event = event
        self.arg = arg
        super().__init__()
