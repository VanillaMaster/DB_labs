CREATE TABLE authors (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE publishers (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE users (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE books (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

ALTER TABLE books ADD author_id BIGINT REFERENCES authors(id)
ALTER TABLE books ADD publisher_id BIGINT REFERENCES publishers(id)

CREATE TABLE issued_books (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    start_date date NOT NULL,
    end_date date
);

ALTER TABLE issued_books ADD user_id BIGINT REFERENCES users(id)
ALTER TABLE issued_books ADD UNIQUE(book_id) BIGINT REFERENCES books(id)







do language plpgsql $$
declare

_author_id bigint;
_publisher_id bigint;
_user_id bigint;
_book_id bigint;

begin

insert into authors(name) values ('author_name')
returning id into _author_id;
insert into publishers(name) VALUES ('publisher_name')
returning id into _publisher_id;
insert into books(name, author_id,publisher_id) VALUES ('book_name', _author_id, _publisher_id)
returning id into _book_id;
insert into users(name) VALUES ('user_name')
returning id into _user_id;

insert into issued_books(user_id, book_id, start_date, end_date) VALUES (_user_id, _book_id, '2022-01-01','2023-01-01')

end;
$$;