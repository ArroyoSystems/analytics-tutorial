# Arroyo Real-time Analytics Tutorial

This repository contains the code for the Arroyo real-time analytics tutorial,
which shows how to use Arroyo to build a real-time web analytic service, similar
to Google Analytic's Real-time mode, with (almost) no code.

This tutorial uses various open-source tools to build its data pipeline:

```mermaid
flowchart LR
    NextJS -->|HTTP| Vector
    Vector --> K1(Kafka)
    K1 --> Arroyo
    Arroyo --> K2(Kafka)
    K2 --> |Debezium| Postgres
    Postgres --> Grafana
    style Arroyo fill: #3182ce
```

See [the video](https://www.youtube.com/watch?v=0c4eEsqVqxA) for the full
walkthrough or check out the summary below.

## Walkthrough

### Ngrok

To run this locally, you will need to create a tunnel from the internet to your computer. For
the tutorial, we used [ngrok](https://ngrok.com) but there are many similar tools.

### Instrumenting our site

We start by instrumenting our site. For the tutorial, we used our homepage (https://arroyo.dev)
to demonstate. We need some way to get HTTP events from our visitors' browsers to our server.

While there are many ways to accomplish this, for simplicity we used a small javascript snippet
that we wired up to our NextJS application to fire on changes to our NextJS router.

That code can be found in [analytics.ts](analytics.ts).

It can be integrated into your application by adding that component somewhere in your source code
(we added ours in src/app/analytics.tsx)


```typescript
<ArroyoPageview endpoint="<ngrok endpoint>" />
```

## Vector

[Vector](https://vector.dev) is a great swiss-army knife for connecting various
data systems and shuttling observability data throughout your data infra. We use
its HTTP server source to collect the analytics events and its Kafka sink to expose
them to Arroyo, using this [vector.toml](vector.toml) config file.

## Kafka

[Kafka](https://kafka.apache.org) is a distributed log that works great with
Arroyo due to its ability to provide exactly-once processing. Here we use it
as both source and sink to get data to Arroyo and to Postgres, via Debezium.

## Arroyo

Arroyo is a powerful yet simple stream processing engine that lets you execute
complex SQL queries against streams of data in real-time. Here, Arroyo reads in
the raw analytics events from Kafka, performs various windowed aggregations, and
writes the results back to Kafka.

The final query we use can be found [here](query.sql)

## Debezium

[Debezium](https://debezium.io) supports connecting relational databases like Postgres
and MySQL to Kafka, providing both sources to read from DBs and sinks to write to them.
Arroyo integrates with Debezium, and here we use it to sink our query results to Postgres.

## PostgreSQL

[PostgreSQL](https://www.postgresql.org/) is a powerful RDBMS that we use to store our
results for querying.

## Grafana

[Grafana](https://grafana.com/) makes it easy to build dashboards, and includes a Postgres
plugin that allows us to query results directly from the database. We use this to visualize
the results.


## Running the tutorial

The tutorial components are packaged up via Docker compose. With Docker installed, you should
just need to run

```sh
$ git clone https://github.com/ArroyoSystems/analytics-tutorial.git
$ cd analytics-tutorial
$ docker compose up
```

Once everything has finished, open http://localhost:8000/pipelines/new to create the pipeline.

Paste in the query [here](query.sql) and click "Start Pipeline."

## Graphing the results

Open up Grafana at http://localhost:3000. Then create a Postgres data source with the options:

* Host: `postgres`
* Database: `postgres`
* User `postgres`
* TLS/SSL Mode: `disable`

Then we can graph the metrics using this query:

```sql
SELECT sum(value), time, tag
FROM metrics
WHERE metric = 'views_15_minute' AND $__timeFilter(time)
GROUP BY time, tag
ORDER BY time;
```

(make sure to change the format to `Time series`).

We can show the top pages in a table with the query:

```sql
SELECT page, count, rank
FROM top_pages
WHERE time = (
  SELECT max(time) from top_pages
)
ORDER BY rank;
```

# Get in touch

If you need help or have any questions/comments/suggestions you can find us on
[Discord](https://discord.gg/cjCr5rVmyR).
