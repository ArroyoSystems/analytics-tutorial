CREATE TABLE metrics (
    time TIMESTAMP,
    metric TEXT,
    value FLOAT,
    tag TEXT
);

CREATE TABLE top_pages (
    time TIMESTAMP,
    page TEXT,
    count FLOAT,
    rank FLOAT
);
