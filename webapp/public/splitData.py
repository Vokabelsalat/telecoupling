

import json

threatcountries = {}
threatcats = {}

for index in range(1,9):
	with open('crawledData ({}).json'.format(index)) as json_file:
		print(json_file)
		data = json.load(json_file)
		for p in data:
			if "trade" in data[p]:
				with open(p.strip().replace(" ", "_")+'_trades.json', 'w') as outfile:
					json.dump(data[p]["trade"], outfile)
			else:
				with open(p.strip().replace(" ", "_")+'_trades.json', 'w') as outfile:
					json.dump({}, outfile)

			if "threats" in data[p]:
				with open(p.strip().replace(" ", "_")+'_threats.json', 'w') as outfile:
					json.dump(data[p]["threats"], outfile)

					for threat in data[p]["threats"]:
						if "consAssCategory" in threat and threat["consAssCategory"] is not None:
							if threat["consAssCategory"].strip() not in threatcats:
								threatcats[threat["consAssCategory"].strip()] = 0

							if threatcats[threat["consAssCategory"].strip()] == 0 and threat["bgciUrl"] is not None:
								threatcats[threat["consAssCategory"].strip()] = threat["bgciUrl"]

						if "countries" in threat:
							country = "".join(threat["countries"])
							if country not in threatcountries:
								threatcountries[country] = {}

							if "consAssCategory" in threat and threat["consAssCategory"] is not None:
								cat = threat["consAssCategory"].strip()

								if threatcats[cat] != 1:
									threatcats[cat] = 1

								if cat not in threatcountries[country]:
									threatcountries[country][cat] = {
										"criteriaUsed": ",".join(threat["criteriaUsed"]) if "criteriaUsed" in threat else "",
										"regionalStatus": ",".join(threat["regionalStatus"]) if "regionalStatus" in threat else "",
										"comment": threat["comment"],
										"interpreted": threat["threatened"],
										"url": threat["bgciUrl"]
									}
			else:
				with open(p.strip().replace(" ", "_")+'_threats.json', 'w') as outfile:
					json.dump({}, outfile)

			data[p].pop('trade', None)
			data[p].pop('threats', None)
			with open(p.strip().replace(" ", "_")+'.json', 'w') as outfile:
				json.dump(data[p], outfile)

with open('threatcountries.json', 'w') as outfile:
	json.dump(threatcountries, outfile)
	outfile.close()

wfile = open("localThreats.csv", "w")
wfile.write(u"%s;%s;%s;%s;%s;%s;%s\n" % ("Land", "Kategorie", "Kriterium", "Regionaler Status", "Kommentar", "Interpretierter Status", "URL"))
for land in threatcountries:
	writeString = "%s;%s;%s;%s;%s;%s;%s\n" % (land, "", "", "", "", "", "")
	wfile.write(writeString.encode("utf8"))
	for cat in threatcountries[land]:
		writeString = "%s;%s;%s;%s;%s;%s;%s\n" % ("", cat, threatcountries[land][cat]["criteriaUsed"], threatcountries[land][cat]["regionalStatus"], threatcountries[land][cat]["comment"], threatcountries[land][cat]["interpreted"], threatcountries[land][cat]["url"])
		wfile.write(writeString.encode("utf8"))

wfile.write(u";;;;;;\n")
wfile.write(u"No country;;;;;;\n")
for cat in threatcats:
	if threatcats[cat] != 1:
		wfile.write(u"%s;%s;%s;%s;%s;%s;%s\n" % ("", cat, "", "", "", "", threatcats[cat]))

wfile.close()