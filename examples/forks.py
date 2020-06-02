from multiprocessing import Process


class Process1(Process):
    def run(self):
        print('Process 1 start')
        breakpoint()
        print('Process 1 end')


class Process2(Process):
    def run(self):
        print('Process 2 start')
        breakpoint()
        print('Process 2 end')


t1 = Process1()
t2 = Process2()
t1.daemon = t2.daemon = True
print('Forking process')
t1.start()
t2.start()

print('Joining')
t1.join()
t2.join()

breakpoint()
print('The End')
