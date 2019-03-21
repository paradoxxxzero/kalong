from threading import Thread


class Thread1(Thread):
    def run(self):
        print('Thread 1 start')
        breakpoint()
        print('Thread 1 end')


class Thread2(Thread):
    def run(self):
        print('Thread 2 start')
        breakpoint()
        print('Thread 2 end')


t1 = Thread1()
t2 = Thread2()
t1.daemon = t2.daemon = True
print('Starting threads')
t1.start()
t2.start()

print('Joining')
t1.join()
t2.join()

breakpoint()
print('The End')
