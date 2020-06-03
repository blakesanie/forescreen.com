from random import shuffle

emails = ["priechma@purdue.edu", "mitra.samantha5@gmail.com", "burkedd@miamioh.edu", "swrgardner3@gmail.com", "michael@stroev.com", "troy.bresch@gmail.com", "alex.sikorsky17@gmail.com", "ramvandermeer@gmail.com", "hachadtarek@gatech.edu", "andypascual@gmail.com", "dtmace2@gmail.com", "paula@stroeva.com", "sofie@stroeva.com", "daksh510@gmail.com", "nikhildesh22@gmail.com", "michael@sanie.com", "celine@sanie.com", "max@stroev.com", "jane@stroeva.com"]
shuffle(emails)
print(emails)
for i in range(1,len(emails),2):
    print("|{}|{}|".format(emails[i - 1], emails[i]))
