from io import open

file = open("lines.txt", encoding='utf-8')

outputArray = []
tempString = ""

lineCounter = 0
for line in file:
	lineCounter = lineCounter + 1

	if lineCounter % 4 == 0:
		tempString = tempString + line.replace("\n", "")
		outputArray.append(tempString)
		print(tempString)
		lineCounter = 0
		tempString = ""

	else:
		tempString = tempString + line.replace("\n", ";")

wfile = open("outputLineBreak.csv", "w", encoding='utf-8')
for line in outputArray:
	wfile.write(u"%s\n" % (line))
