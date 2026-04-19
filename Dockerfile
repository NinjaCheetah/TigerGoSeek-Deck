FROM python:3.14-slim-trixie

RUN ln -sf /usr/share/zoneinfo/America/New_York /etc/localtime

WORKDIR /srv/tigergoseek

RUN pip install --upgrade pip

COPY requirements.txt /srv/tigergoseek

RUN pip install -r requirements.txt

COPY . /srv/tigergoseek

ENTRYPOINT ["uvicorn", "api:app", "--host=0.0.0.0", "--port=4567"]
