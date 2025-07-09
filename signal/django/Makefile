.PHONY: hello runserver migrate makemigrations

manage := ./rtc_signaling/manage.py

migrate:
	python3 ${manage} migrate

makemigrations:
	python3 ${manage} makemigrations 

runserver:
	python3 ${manage} runserver
